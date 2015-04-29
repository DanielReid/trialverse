package org.drugis.trialverse.graph.repository.impl;

import org.apache.commons.io.IOUtils;
import org.apache.http.Header;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.message.BasicHeader;
import org.apache.http.util.EntityUtils;
import org.apache.jena.riot.RDFLanguages;
import org.drugis.trialverse.dataset.model.VersionMapping;
import org.drugis.trialverse.dataset.repository.VersionMappingRepository;
import org.drugis.trialverse.exception.ReadGraphException;
import org.drugis.trialverse.graph.repository.GraphReadRepository;
import org.drugis.trialverse.util.Namespaces;
import org.drugis.trialverse.util.WebConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import javax.inject.Inject;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;

/**
 * Created by connor on 28-11-14.
 */
@Repository
public class GraphReadRepositoryImpl implements GraphReadRepository {

  public static final String DATA_ENDPOINT = "/data";
  public static final String GRAPH = "graph";
  @Inject
  private HttpClient httpClient;

  @Inject
  private VersionMappingRepository versionMappingRepository;

  @Inject
  private WebConstants webConstants;

  private final Logger logger = LoggerFactory.getLogger(getClass());

  @Override
  public byte[] getGraph(URI trialverseDatasetUri, String versionUuid, String graphUUID) throws IOException, ReadGraphException {
    VersionMapping versionMapping = versionMappingRepository.getVersionMappingByDatasetUrl(trialverseDatasetUri);

    UriComponents uriComponents = UriComponentsBuilder.fromHttpUrl(versionMapping.getVersionedDatasetUrl())
            .path(DATA_ENDPOINT)
            .queryParam(GRAPH, Namespaces.GRAPH_NAMESPACE + graphUUID)
            .build();
    HttpGet request = new HttpGet(uriComponents.toUri());
    String headerValue = webConstants.buildVersionUri(versionUuid).toString();
    Header acceptVersionHeader = new BasicHeader(WebConstants.X_ACCEPT_EVENT_SOURCE_VERSION, headerValue);
    request.setHeader(acceptVersionHeader);
    request.addHeader(org.apache.http.HttpHeaders.ACCEPT, RDFLanguages.TURTLE.getContentType().getContentType());
    try(CloseableHttpResponse response =  (CloseableHttpResponse) httpClient.execute(request);
        InputStream contentStream = response.getEntity().getContent()) {
      byte[] content = IOUtils.toByteArray(contentStream);
      EntityUtils.consume(response.getEntity());
      return content;
    } catch (Exception e) {
      logger.debug("error updating graph {}", e);
      throw new ReadGraphException();
    }
  }

}
