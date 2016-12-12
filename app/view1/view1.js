'use strict';

angular.module('appLolIse.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'app/view1/view1.html',
    controller: 'View1Ctrl',
    resolve: {
        items: function($http){
            //TODO: Use system language for locale
            var url = 'http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/item.json';
            //var url = 'https://global.api.pvp.net/api/lol/static-data/euw/v1.2/item?locale=en_US&itemListData=colloq,stacks,hideFromAll,requiredChampion,consumed,gold,image,into,maps,requiredChampion,tags,tree&api_key=RGAPI-c12afc1e-2d25-4388-959d-b1e9eb797d44';
            return $http.get(url)
                .then(function(response){return response.data;});
        }
    }
  });
}])

.controller('View1Ctrl', ['$scope', 'items', function($scope, items) {
        /**
         * **************************************************************************************
         * LOCAL VARS
         */
        var defaultSet = {
            title: 'Custom Item Set',
            map: 'any',
            mode: 'any',
            priority: false,
            sortrank: null,
            blocks: [
                {
                    type: "A block with just boots",
                    showIfSummonerSpell: "",
                    hideIfSummonerSpell: "",
                    items: [
                        {id: "1001", count: 1}
                    ]
                }
            ]
        }

        /**
         * **************************************************************************************
         * SCOPE VARS
         */
        $scope.url = "http://ddragon.leagueoflegends.com/cdn/"+items.version+"/img";
        $scope.items = items.data;
        //Clean unused items
        _.each($scope.items, function(item, key){
            item.id = key;
            if(!item.gold.purchasable || item.hideFromAll){
                delete $scope.items[key];
            }
        })
        $scope.itemsArray = _.toArray($scope.items);
        $scope.set = angular.copy(defaultSet);

        //Maps
        //Img: http://ddragon.leagueoflegends.com/cdn/6.8.1/img/map/map11.png
        $scope.maps = {
            //1:	"Original Summoner's Rift",
            any: {name: "Any", code: null},
            TT:	{name: "Twisted Treeline", code: 10},
            SR:	{name: "Summoner's Rift", code: 11},
            HA:	{name: "Howling Abyss", code: 12}
        }

        $scope.draggable = {
            helper: 'clone',
            placeholder: 'ise-item-dragged',
            connectWith: '.ise-block-items',
            update: function(event, ui){ui.item.sortable.cancel();}
        }

        $scope.sortable = {
            receive: function(event, ui){
                ui.item.sortable.cancel();
                var model = ui.item.sortable.model;
                var id = model.id.toString();
                var blockItems = ui.item.sortable.droptargetModel;
                var position = ui.item.sortable.dropindex

                //If the item stacks, check if we should stack
                if(model.stacks){
                    //Find item in current array
                    var found = _.findWhere(blockItems, {id: id});
                    if(found){
                        if(model.stacks > found.count){
                            found.count++;
                            return; //we do nothing else
                        }
                        else{
                            throw "Maximum reached";
                        }
                    }
                }

                //Create item in block
                blockItems.splice(position, 0, {
                    id: id,
                    count: 1
                })
            }
        }

        /**
         * **************************************************************************************
         * SCOPE METHODS
         */
        $scope.selectItem = function(item){
            console.log(item);
        }
        $scope.addBlock = function(){
            $scope.set.blocks.push({
                type: "New Block",
                items: []
            })
        }
}]);