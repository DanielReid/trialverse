'use strict';
define(
  ['angular',
    'require',
    'jQuery',
    'foundation',
    'mmfoundation',
    'angular-ui-router',
    'user/user',
    'dataset/dataset',
    'util/util',
    'study/study',
    'graph/graph',
    'populationInformation/populationInformation',
    'arm/arm',
    'outcome/outcome',
    'populationCharacteristic/populationCharacteristic',
    'endpoint/endpoint',
    'adverseEvent/adverseEvent',
    'epoch/epoch',
    'results/results',
    'measurementMoment/measurementMoment',
    'activity/activity',
    'studyDesign/studyDesign',
    'concept/concept',
    'commit/commit',
    'mapping/mapping',
    'studyInformation/studyInformation',
    'angular-resource',
    'angular-md5',
    'lodash'
  ],
  function(angular) {
    var dependencies = [
      'ui.router',
      'mm.foundation.modal',
      'mm.foundation.typeahead',
      'angular-md5',
      'trialverse.user',
      'trialverse.dataset',
      'trialverse.util',
      'trialverse.graph',
      'trialverse.study',
      'trialverse.populationInformation',
      'trialverse.arm',
      'trialverse.outcome',
      'trialverse.populationCharacteristic',
      'trialverse.endpoint',
      'trialverse.adverseEvent',
      'trialverse.epoch',
      'trialverse.measurementMoment',
      'trialverse.studyDesign',
      'trialverse.activity',
      'trialverse.results',
      'trialverse.concept',
      'trialverse.commit',
      'trialverse.mapping',
      'trialverse.studyInformation'
    ];


    Number.isInteger = Number.isInteger || function(value) {
        return typeof value === 'number' &&
          isFinite(value) &&
          Math.floor(value) === value;
      };

    var app = angular.module('trialverse', dependencies);

    app.run(['$rootScope', '$window', '$http',
      function($rootScope, $window, $http) {
        var csrfToken = $window.config._csrf_token;
        var csrfHeader = $window.config._csrf_header;

        $http.defaults.headers.common[csrfHeader] = csrfToken;
        $rootScope.$on('$viewContentLoaded', function() {
          $(document).foundation();
        });
      }
    ]);

    app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
      function($stateProvider, $urlRouterProvider, $httpProvider) {
        $httpProvider.interceptors.push('SessionExpiredInterceptor');

        $stateProvider
          .state('user', {
            url: '/users/:userUid',
            templateUrl: 'app/js/user/user.html',
            controller: 'UserController'
          })
          .state('create-dataset', {
            url: '/users/:userUid/create-dataset',
            templateUrl: 'app/js/user/createDataset.html',
            controller: 'CreateDatasetController'
          })
          .state('versionedDataset', {
            url: '/users/:userUid/datasets/:datasetUUID/versions/:versionUuid',
            templateUrl: 'app/js/dataset/dataset.html',
            controller: 'DatasetController'
          })
          .state('datasetHistory', {
            url: '/users/:userUid/datasets/:datasetUUID/history',
            templateUrl: 'app/js/dataset/datasetHistory.html',
            controller: 'DatasetHistoryController'
          })
          .state('versionedDataset.concepts', {
            url: '/concepts',
            templateUrl: 'app/js/concept/concepts.html',
            controller: 'ConceptController'
          })
          .state('versionedDataset.study', {
            url: '/studies/:studyGraphUuid',
            templateUrl: 'app/js/study/view/study.html',
            controller: 'StudyController'
          });

        // Default route
        $urlRouterProvider.otherwise('/users/');
      }
    ]);

    app.constant('SCRATCH_RDF_STORE_URL', '/scratch');
    app.constant('CONCEPT_GRAPH_UUID', 'concepts');
    app.constant('GROUP_ALLOCATION_OPTIONS', _.indexBy([{
      uri: 'http://trials.drugis.org/ontology#AllocationRandomized',
      label: 'Randomized'
    }, {
      uri: 'http://trials.drugis.org/ontology#AllocationNonRandomized',
      label: 'Non-Randomized'
    }, {
      uri: 'unknown',
      label: 'Unknown'
    }], 'uri'));
    app.constant('BLINDING_OPTIONS', _.indexBy([{
      uri: 'http://trials.drugis.org/ontology#OpenLabel',
      label: 'Open'
    }, {
      uri: 'http://trials.drugis.org/ontology#SingleBlind',
      label: 'Single blind'
    }, {
      uri: 'http://trials.drugis.org/ontology#DoubleBlind',
      label: 'Double blind'
    }, {
      uri: 'http://trials.drugis.org/ontology#TripleBlind',
      label: 'Triple blind'
    }, {
      uri: 'unknown',
      label: 'Unknown'
    }], 'uri'));
    app.constant('STATUS_OPTIONS', _.indexBy([{
      uri: 'http://trials.drugis.org/ontology#StatusRecruiting',
      label: 'Recruiting'
    }, {
      uri: 'http://trials.drugis.org/ontology#StatusEnrolling',
      label: 'Enrolling'
    }, {
      uri: 'http://trials.drugis.org/ontology#StatusActive',
      label: 'Active'
    }, {
      uri: 'http://trials.drugis.org/ontology#StatusCompleted',
      label: 'Completed'
    }, {
      uri: 'http://trials.drugis.org/ontology#StatusSuspended',
      label: 'Suspended'
    }, {
      uri: 'http://trials.drugis.org/ontology#StatusTerminated',
      label: 'Terminated'
    }, {
      uri: 'http://trials.drugis.org/ontology#StatusWithdrawn',
      label: 'Withdrawn'
    }, {
      uri: 'unknown',
      label: 'Unknown'
    }], 'uri'));

    return app;
  });
