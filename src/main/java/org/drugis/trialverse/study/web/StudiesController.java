package org.drugis.trialverse.study.web;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.drugis.trialverse.concept.Concept;
import org.drugis.trialverse.queries.CachedQueryTemplateFactory;
import org.drugis.trialverse.queries.CachedQueryTemplateFactory.QueryTemplate;
import org.drugis.trialverse.queries.QueryTemplateFactory;
import org.drugis.trialverse.study.Study;
import org.drugis.trialverse.study.StudyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.EntityLinks;
import org.springframework.hateoas.ExposesResourceFor;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/studies")
@ExposesResourceFor(Study.class)
public class StudiesController {

	private final StudyRepository d_studies;
	private final EntityLinks d_entityLinks; 

	@Autowired
	public StudiesController(StudyRepository studies, CachedQueryTemplateFactory tmpl, EntityLinks entityLinks) {
		Assert.notNull(studies, "StudyRepository must not be null!");
		Assert.notNull(entityLinks, "EntityLinks must not be null!");
		d_studies = studies;
		d_entityLinks = entityLinks;

	}
	
	@RequestMapping("/findByConcepts")
	@ResponseBody
	public ResponseEntity<List<Resource<Study>>> getStudiesForConcepts(
			@RequestParam UUID indication,
			@RequestParam List<UUID> variables,
			@RequestParam List<UUID> treatments) { 
		
		List<Study> studies = d_studies.findStudies(indication, variables, treatments);
		
		List<Resource<Study>> result = new ArrayList<>();
		for(Study study : studies) { 
			Resource<Study> resource = new Resource<Study>(study);
			result.add(resource);
			resource.add(d_entityLinks.linkForSingleResource(study).withSelfRel());
		}
		return new ResponseEntity<List<Resource<Study>>>(result, HttpStatus.OK);
	}
	
}