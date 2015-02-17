'use strict';
define(['angular', 'angular-mocks', 'testUtils'], function(angular, angularMocks, testUtils) {
  describe('the adverse event service', function() {

    var graphUri = 'http://karma-test/';
    var scratchStudyUri = 'http://localhost:9876/scratch';

    var rootScope, q, httpBackend;
    var remotestoreServiceStub;
    var studyService;
    var resultsService;
    var outcomeVariableUri;

    var updateResultValueQueryRaw;
    var queryResultsRaw;
    var addResultValueRaw;
    var deleteResultsRaw;
    var setOutcomeResultPropertyTemplate;

    beforeEach(function() {
      module('trialverse.util', function($provide) {
        remotestoreServiceStub = jasmine.createSpyObj('RemoteRdfStoreService', [
          'create',
          'load',
          'executeUpdate',
          'executeQuery',
          'getGraph',
          'deFusekify'
        ]);
        $provide.value('RemoteRdfStoreService', remotestoreServiceStub);
      });
    });

    beforeEach(module('trialverse.results'));

    beforeEach(inject(function($q, $rootScope, $httpBackend, ResultsService, StudyService, SparqlResource) {
      q = $q;
      httpBackend = $httpBackend;
      rootScope = $rootScope;
      resultsService = ResultsService;
      studyService = StudyService;

      // reset the test graph
      testUtils.dropGraph(graphUri);

      // load service templates and flush httpBackend
      addResultValueRaw = testUtils.loadTemplate('addResultValue.sparql', httpBackend);
      updateResultValueQueryRaw = testUtils.loadTemplate('updateResultValue.sparql', httpBackend);
      queryResultsRaw = testUtils.loadTemplate('queryResults.sparql', httpBackend);
      deleteResultsRaw = testUtils.loadTemplate('deleteResultValue.sparql', httpBackend);

      SparqlResource.get('setOutcomeResultProperty.sparql');
      setOutcomeResultPropertyTemplate = testUtils.loadTemplate('setOutcomeResultProperty.sparql', httpBackend);

      httpBackend.flush();

      // create and load empty test store
      var createStoreDeferred = $q.defer();
      var createStorePromise = createStoreDeferred.promise;
      remotestoreServiceStub.create.and.returnValue(createStorePromise);

      var loadStoreDeferred = $q.defer();
      var loadStorePromise = loadStoreDeferred.promise;
      remotestoreServiceStub.load.and.returnValue(loadStorePromise);

      studyService.loadStore();
      createStoreDeferred.resolve(scratchStudyUri);
      loadStoreDeferred.resolve();

      outcomeVariableUri = 'http://uri.com/var';

      // add a outcome
      var addOutcomeQuery = 'PREFIX instance: <http://trials.drugis.org/instances/>' +
      ' PREFIX ontology: <http://trials.drugis.org/ontology#>' +
      ' PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
      ' ' + 
      ' INSERT DATA {' +
      '  graph <' + graphUri + '> {' +
      '    <' + outcomeVariableUri+ '> '  +
      '    rdfs:label "my outcome" ;' +
      '    ontology:measurementType <http://trials.drugis.org/ontology#dichotomous> ;' +
      '    rdfs:subClassOf ontology:Endpoint ; ' +
      '    ontology:has_result_property ontology:count ;' + 
      '    ontology:has_result_property ontology:sample_size . ' +
      '  } ' + 
      ' } ' ;

      testUtils.executeUpdateQuery(addOutcomeQuery);


      rootScope.$digest();

      // stub remotestoreServiceStub.executeUpdate method
      remotestoreServiceStub.executeUpdate.and.callFake(function(uri, query) {
        query = query.replace(/\$graphUri/g, graphUri);

        //console.log('graphUri = ' + uri);
        //console.log('query = ' + query);

        var updateResponce = testUtils.executeUpdateQuery(query);
        //console.log('updateResponce ' + updateResponce);

        var executeUpdateDeferred = q.defer();
        executeUpdateDeferred.resolve();
        return executeUpdateDeferred.promise;
      });

    }));

    describe('updateResultValue', function() {
      describe('when there is not yet data in the graph', function() {

        it('should add the value to the graph', function(done) {

          var row = {
            variable: {
              uri: outcomeVariableUri
            },
            arm: {
              uri: 'http://uri.com/arm'
            },
            measurementMoment: {
              uri: 'http://uri.com/mm'
            }
          };
          var inputColumn = {
            valueName: 'count',
            value: 123
          };
          // call the method to test
          var resultPromise = resultsService.updateResultValue(row, inputColumn);

          resultPromise.then(function() {
            var query = queryResultsRaw.replace(/\$graphUri/g, graphUri)
              .replace(/\$outcomeUri/g, row.variable.uri);
            var resultAsString = testUtils.queryTeststore(query);
            var results = testUtils.deFusekify(resultAsString);
            expect(results.length).toBe(2);
            expect(results[0].value).toEqual(undefined);
            expect(results[1].value).toEqual(inputColumn.value.toString());
            done();
          });
          // fire in the hole !
          rootScope.$digest();
        });
      });

      describe('when there is data in the graph', function() {
        var inputColumn = {
          valueName: 'sample_size',
          value: 456
        };
        var results;

        beforeEach(function(done) {
          var row = {
            variable: {
              uri: outcomeVariableUri
            },
            arm: {
              uri: 'http://uri.com/arm'
            },
            measurementMoment: {
              uri: 'http://uri.com/mm'
            }
          };

          resultsService.updateResultValue(row, inputColumn).then(function() {
            var query = queryResultsRaw.replace(/\$graphUri/g, graphUri)
              .replace(/\$outcomeUri/g, row.variable.uri);
            var resultAsString = testUtils.queryTeststore(query);
            results = testUtils.deFusekify(resultAsString);
            done();
          });
          rootScope.$digest();
        });

        describe('if the new value is a value', function() {

          it('should save the value to the graph', function(done) {
            var row = {
              variable: {
                uri: outcomeVariableUri
              },
              arm: {
                uri: 'http://uri.com/arm'
              },
              measurementMoment: {
                uri: 'http://uri.com/mm'
              },
              uri: results[0].instance
            };

            inputColumn.value = 347856;
            resultsService.updateResultValue(row, inputColumn).then(function() {
              var query = queryResultsRaw.replace(/\$graphUri/g, graphUri)
                .replace(/\$outcomeUri/g, row.variable.uri);
              var updatedResults = testUtils.deFusekify(testUtils.queryTeststore(query));
              expect(updatedResults.length).toBe(2);
              expect(updatedResults[0].value).toEqual(inputColumn.value.toString());
              expect(updatedResults[1].value).toEqual(undefined);
              console.log('res = ' + JSON.stringify(updatedResults));
              done();
            });
          });

        });

        describe('if the new value is null', function() {

          it('should delete the value from the graph', function(done) {

            var row = {
              variable: {
                uri: outcomeVariableUri
              },
              arm: {
                uri: 'http://uri.com/arm'
              },
              measurementMoment: {
                uri: 'http://uri.com/mm'
              },
              uri: results[0].instance
            };
            inputColumn.value = null;
            inputColumn.valueName = 'sample_size';
            resultsService.updateResultValue(row, inputColumn).then(function() {
              var query = queryResultsRaw.replace(/\$graphUri/g, graphUri)
                .replace(/\$outcomeUri/g, row.variable.uri);
              var updatedResults = testUtils.deFusekify(testUtils.queryTeststore(query));
              expect(updatedResults[0].value).toBe(undefined);
              done();
            });
          });

        });

      });
    });


  });
});
