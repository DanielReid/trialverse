'use strict';
define([], function() {

  var dependencies = ['$resource'];
  var VersionedGraphResource = function($resource) {
    return $resource(
      '/datasets/:datasetUUID/versions/:versionUuid/graphs/:graphUuid', {
        datasetUUID: '@datasetUUID',
        graphUuid: '@graphUuid',
        versionUuid: '@versionUuid'
      }, {
        'get': {
          method: 'get',
          headers: {
            'Content-Type': 'text/n3'
          },
          transformResponse: function(data) {
            return {
              data: data // property on Responce object to access raw result data
            };
          }
        }
      });
  };
  return dependencies.concat(VersionedGraphResource);
});
