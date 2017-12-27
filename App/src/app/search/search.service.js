(function () {
    'use strict';
    angular.module('app.search').factory('searchService', ['$q', '$filter','authService', 'firebaseDataRef', '$firebaseObject', '$firebaseArray','elasticSearch',
    function ($q,$filter, authService, firebaseDataRef, $firebaseObject, $firebaseArray,elasticSearch) {
            var service = {
                search: search,
                convertDataSnapshot : convertDataSnapshot,
                convertDataByIds: convertDataByIds
            };

            return service;
            //query : query elastic search
            //childRef : nodeName data in firebase.
            //isIds: get via Snapshot Or from firebase.

            function search(query,childRef,isIds){
                var result = {
                    items: [],
                    totalRecords: 0,
                    pages: 0
                };
                var req = elasticSearch.search(query);
                req = req.then(function (response) {
                    if(!response.hits || !response.hits.hits || !response.hits.total){
                        return result;
                    }
                    if(isIds){
                        return convertDataByIds(response.hits.hits,childRef).then(function(items){
                            return {
                                items: items,
                                totalRecords: response.hits.total,
                                pages: Math.ceil(response.hits.total / query.size)
                            };
                        });
                    }else{
                         return {
                            items: convertDataSnapshot(response.hits.hits,childRef),
                            totalRecords: response.hits.total,
                            pages: Math.ceil(response.hits.total / query.size)
                        };
                    }
                });

                return req;
            }

            function convertDataSnapshot(obj, childRef){
               var rs = _.map(obj, function (val, key) {
                    var data = val._source;
                    if(childRef.includes('membership-application-snapshot') === true){
                        data.$id = data.appId;    
                    }else if(childRef.includes('membership-snapshot') === true){
                        data.$id = data.membershipId;  
                    }else{
                        data.$id = val._id;
                    }
                    return data;
                });
                return rs;
            }

            function convertDataByIds(obj,childRef){
                var rs = _.map(obj, function (val, key) {
                    return val._id;
                });

                return getListItems(rs,childRef);
            }

            function getListItems(ids,childRef){
                var reqs = _.map(ids, id=>{
                    var ref = firebaseDataRef.child('/'+childRef+'/'+id);
                    return $firebaseObject(ref);
                });
                
                return $q.all(reqs);
            }
        }
    ]);
})();
