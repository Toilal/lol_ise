'use strict';

angular.module('appLolIse.viewMain', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/viewMain', {
        templateUrl: 'app/viewMain/viewMain.html',
        controller: 'ViewMainCtrl',
        resolve: {
            items: function($http, ddragon){
                //TODO: Use system language for locale
                var url = ddragon.getBaseUrl() + 'data/en_US/item.json';
                return $http.get(url)
                    .then(function(response){return response.data;});
            },
            champions: function($http, ddragon){
                //TODO: Use system language for locale
                var url = ddragon.getBaseUrl() + 'data/en_US/champion.json';
                //var url = 'https://global.api.pvp.net/api/lol/static-data/euw/v1.2/item?locale=en_US&itemListData=colloq,stacks,hideFromAll,requiredChampion,consumed,gold,image,into,maps,requiredChampion,tags,tree&api_key=RGAPI-c12afc1e-2d25-4388-959d-b1e9eb797d44';
                return $http.get(url)
                    .then(function(response){return response.data.data;});
            },
            language: function($http, ddragon){
                http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/language.json
                    //TODO: Use system language for locale
                    var url = ddragon.getBaseUrl() + 'data/en_US/language.json';
                //var url = 'https://global.api.pvp.net/api/lol/static-data/euw/v1.2/item?locale=en_US&itemListData=colloq,stacks,hideFromAll,requiredChampion,consumed,gold,image,into,maps,requiredChampion,tags,tree&api_key=RGAPI-c12afc1e-2d25-4388-959d-b1e9eb797d44';
                return $http.get(url)
                    .then(function(response){return response.data.data;});
            }
        }
    });
}])

.controller('ViewMainCtrl', ['$scope', '$filter', 'ddTranslate', 'items', 'champions', 'language', function($scope, $filter, ddTranslate, items, champions, language) {
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
        champion: _.toArray(champions)[70].id,
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

    //Set language
    ddTranslate.setLanguage(language);


    /**
     * **************************************************************************************
     * SCOPE VARS
     */
    //Used items (we clean the unused ones)
    $scope.items = items.data;
    _.each($scope.items, function(item, key){
        item.id = key;
        if(!item.gold.purchasable || item.plaintext == ""){
            delete $scope.items[key];
        }
    })

    //Searchable items array list
    $scope.itemsArray = _.toArray($scope.items);

    //Sets we manage (init to default set) & current set
    $scope.sets = [
        angular.copy(defaultSet)
    ];
    $scope.set = $scope.sets[0];

    //Maps
    //Img: http://ddragon.leagueoflegends.com/cdn/6.8.1/img/map/map11.png
    $scope.maps = {
        //1:	"Original Summoner's Rift",
        any: {name: "Any Map", code: null},
        SR:	{name: ddTranslate.get('Map1'), code: 11},
        TT:	{name: ddTranslate.get('Map10'), code: 10},
        HA:	{name: ddTranslate.get('Map12'), code: 12}
    }

    //Champions
    $scope.champions = champions;

    //Tags
    $scope.tags = _.chain($scope.items).pluck('tags').flatten().uniq().map(function(tag){
        var colloq = language['colloq_' + tag] && language['colloq_' + tag].length>1 ? language['colloq_' + tag]:'';
        var translate = language[tag] ? language[tag]:'';

        var label = colloq ? _.last(colloq.split(';')).toUpperCase() : translate;

        if(label){
            return {
                code: tag,
                label: label,
                sort: colloq ? 0:1
            }
        }
    }).filter().value().sort();

    //Filters for items
    $scope.filters = {
        string: ''
    }

    //Draggable config (list of all items)
    $scope.draggable = {
        helper: 'clone',
        placeholder: 'ise-item-placeholder',
        connectWith: '.ise-block-items-dropzone',
        update: function(event, ui){ui.item.sortable.cancel();}
    }

    //Sortable config (config for each block)
    $scope.sortable = {
        placeholder: 'ise-item-placeholder',
        receive: function(event, ui){
            ui.item.sortable.cancel();
            var model = ui.item.sortable.model;
            var id = model.id.toString();
            var blockItems = ui.item.sortable.droptargetModel;
            var position = ui.item.sortable.dropindex;

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

    $scope.removeItemFromBlock = function(block, item, $event){
        $event.stopPropagation();
        if(item.count>1){
            //If more than one item, simply reduce the counter
            item.count--;
        }
        else{
            //Otherwise completely remove item
            block.items.splice(block.items.indexOf(item), 1);
        }
    }

    $scope.selectSet = function(theSet){
        $scope.set = theSet;
    }

    $scope.addBlock = function(){
        $scope.set.blocks.push({
            type: "New Block",
            items: []
        })
    }

    //Pass the translation method
    $scope.translate = ddTranslate.get;

    /**
     * **************************************************************************************
     * WATCHES
     */
    $scope.$watch('filters.string', function(value){
//       $scope.itemsArray = $filter('filter')(_.toArray($scope.items), {'*':value});
    })
    $scope.$watchCollection('sets', function(){
        $scope.setsArray = _.groupBy($scope.sets, 'champion');
        console.log('Array update, champs:', _.toArray($scope.setsArray).length, 'sets:', _.toArray($scope.sets).length);
    });
}]);