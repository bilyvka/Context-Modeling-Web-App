'use strict';

angular.module('myApp.viewContextConfig', ['ngRoute','ngMaterial'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/viewContextConfig', {
            templateUrl: 'viewContextConfig/viewContextConfig.html',
            controller: 'viewContextConfigCtrl'
        });
    }])

    .controller('viewContextConfigCtrl', ['$scope', 'filterFilter', '$compile','$mdDialog','uuid','$http', function ($scope, $filterFilter, $compile,$mdDialog,uuid,$http) {
        $scope.scenarioName = 'Scenario1';

        $scope.elements = {};

        $scope.selectedEl = null;

        //for drawing connections
       // $scope.startDraw = false;
        $scope.startX = 0.0;
        $scope.startY = 0.0;

        $scope.URL =  "http://localhost:3001";

        //Keys
        var deleteKeyCode = 8;
        //localStorage.setItem("clientId","54fbaeee-a875-75a0-2398-7266cee9616b");

        //test
        var elementA = {
            name: "A",
            type: "simpleElement",
            id: "a",
            properties: [{name:"location",type:"location"},{name:"property2",type:"text"}],
            linksIn: [],
            linksOut: [],
            left:38,
            top:50,
            width:120,
            height:100
        }

        var elementB = {
            name: "Google Places API",
            type: "enrichedElement",
            enrichedElementType:"WS",
            id: "b",
            properties: [{name:"property1",type:"text"},{name:"property2",type:"text"}],
            enrichedProperties:{name:"Google Places",url:"someURL","api_key":"api_key",client_id:"client_id",client_secret:"client_secret",format:"json"},
            inputParameters:[ {name:"radius",value:"5",field_name:""},{name:"location",value:"",field_name:""},{name:"type",value:"cafe",field_name:""}],
            outputParameters:[{name:"Place Name",value:"value 1"},{name:"Place Type",value:"value 1"}],
            linksIn: [],
            linksOut: [],
            left:380,
            top:100,
            width:120,
            height:100
        }



       // $scope.elements['a'] = elementA;
       // $scope.elements['b'] = elementB;
        //console.log($scope.elements)

        $scope.enrichedElementTypes = [
            {id: 'WS', name: 'Web Service API'},
            {id: 'formula', name: 'Algorithm/Calculation'}

        ]

        $scope.enrichedProperties = {
            formatTypes:[
                {id:'json', name:'JSON'},
                {id:'xml', name:'XML'},
                {id:'csv', name:'CSV'}
            ]
        }


        $scope.selectedElement = false

        $scope.properties = {
            types: [
                {id: 'numerical', name: 'Numerical'},
                {id: 'categorical', name: 'Categorical'},
                {id: 'boolean', name: 'Boolean'},
                {id: 'text', name: 'Text'},
                {id: 'location', name: 'Location'},
                {id:'image64',name:'image(based64)'},
                {id:'image64metadata',name:'image64+location metadata'}
            ]
        }

        $scope.showInfo = function (infoCode) {

            var infoEl = angular.element(document.querySelector('#info'));
            infoEl.empty()
            infoEl.append(infoData[infoCode]);
        }


        //information mapping
        var infoData = {
            "CE": "Context Elements view provides elements for context modeling. You can drag and drop element to the Editor area and start model the context.",
            "ED": "Editor view is responsible for modeling of context of mobile application. It has a panel of basic elements (such as circle, rectangle and text).",
            "PR": "Properties show the properties of the added/selected element in the Editor. You can create new properties for each element. The property represent a context information.",
            "EI": "Editor information view is showing a simple keys for context modeling.",
            "AE": "All Elements shows a list of elements that you have created. You can select an element and delete it from the Editor view by using button Delete",
            "IV": "Information view shows information about the application views and how to use them. </br>  Click on any element to see the information about it..."

        }





        $scope.limitKeypress = function ($event, value, maxLength) {

            if (value != undefined && value.toString().length >= maxLength) {
                $event.preventDefault();
            }


            //updateElWidth()
        }

        function updateElWidth (){
            var el = $scope.selectedEl

            var nameLen = el.name.length;


            var maxPropLen = 0;
            for(var i=0;i<el.properties.length;i++){
                if(el.properties[i].name.length>maxPropLen){
                    maxPropLen =  el.properties[i].name.length
                }
            }

            var maxLen = maxPropLen > nameLen ? maxPropLen:nameLen
            //console.log(maxLen)
            if (maxLen>13 && maxLen<30){
                $scope.selectedEl.width =   $scope.selectedEl.width +8
            }
        }

        $scope.resizeElementOnKeydown = function($event, value){

            if (value != undefined){


                if($event.keyCode === 8){
                    //updateElWidth()
                }
            }
        }

        $scope.drop = function (id,type,x,y,w,h) {



            switch (type) {
                case 'simpleElement':
                    var newElement = {
                        name: "Name",
                        type: type,
                        id: id,
                        properties: [{name:"property1",type:"text"},{name:"property2",type:"text"}],
                        linksIn: [],
                        linksOut: [],
                        left:x,
                        top:y,
                        width:w,
                        height:h
                    }
                    break;
                case 'enrichedElement':
                    var newElement = {
                        name: "Name",
                        type: type,
                        id: id,
                        enrichedElementType:"",
                       // properties: [{name:"propertyIn",type:"text"},{name:"propertyIn",type:"text"},{name:"propertyOut",type:"text"}],
                        enrichedProperties:{name:"",url:"","api_key":"",client_id:"",client_secret:"",format:""},
                        inputParameters:[{name:"input 1",value:"value 1"}],
                        outputParameters:[{name:"output 1",value:"value 1"}],
                        linksIn: [],
                        linksOut: [],
                        left:x,
                        top:y,
                        width:w,
                        height:h
                    }
                    break;
                case 'abstractElement':
                    var newElement = {
                        name: "Name",
                        type: type,
                        id: id,
                        properties:[],
                        linksIn: [],
                        linksOut: [],
                        left:x,
                        top:y,
                        width:w,
                        height:h
                    }
                    break;
                default:
            }


            $scope.elements[id] = newElement;

            showProperties(id);
            $scope.$apply();


        }


        $scope.click = function (elementId) {
           //console.log(elementId)
           // console.log(document.querySelector('#'+elementId))

           showProperties(elementId);



        }

        function connectElements(svg,path,startElem,endElem){
            // if first element is lower than the second, swap!

            var svgContainer = document.querySelector('#container');


            if(startElem.getBoundingClientRect().top > endElem.getBoundingClientRect().top){

                var temp = startElem;
                startElem = endElem;
                endElem = temp;
            }

            // get (top, left) corner coordinates of the svg container
            var svgTop  = svgContainer.getBoundingClientRect().top;
            var svgLeft = svgContainer.getBoundingClientRect().left;

            // get (top, left) coordinates for the two elements
            var startCoord = startElem.getBoundingClientRect();
            var endCoord   = endElem.getBoundingClientRect();

            // calculate path's start (x,y)  coords
            // we want the x coordinate to visually result in the element's mid point
            var startX = startCoord.left + 0.5*startElem.getBoundingClientRect().height - svgLeft;    // x = left offset + 0.5*width - svg's left offset
            var startY = startCoord.top  + startElem.getBoundingClientRect().height - svgTop;        // y = top offset + height - svg's top offset

            // calculate path's end (x,y) coords
            var endX = endCoord.left + 0.5*endElem.getBoundingClientRect().width - svgLeft;
            var endY = endCoord.top  - svgTop;

            // call function for drawing the path
            drawPath(angular.element(svg), angular.element(path), startX, startY, endX, endY);

        }

        //helper functions, it turned out chrome doesn't support Math.sgn()
        function signum(x) {
            return (x < 0) ? -1 : 1;
        }
        function absolute(x) {
            return (x < 0) ? -x : x;
        }

        function drawPath(svg, path, startX, startY, endX, endY) {
             // console.log(endY)

            // get the path's stroke width (if one wanted to be  really precize, one could use half the stroke size)
            var stroke =  parseFloat(path.attr("stroke-width"));
            // check if the svg is big enough to draw the path, if not, set heigh/width
            if (svg.attr("height") <  endY)                 svg.attr("height", endY + 100);
            if (svg.attr("width" ) < (startX + stroke) )    svg.attr("width", (startX + stroke));
            if (svg.attr("width" ) < (endX   + stroke) )    svg.attr("width", (endX   + stroke));

            var deltaX = (endX - startX) * 0.15;
            var deltaY = (endY - startY) * 0.15;
            // for further calculations which ever is the shortest distance
            var delta  =  deltaY < absolute(deltaX) ? deltaY : absolute(deltaX);

            // set sweep-flag (counter/clock-wise)
            // if start element is closer to the left edge,
            // draw the first arc counter-clockwise, and the second one clock-wise
            var arc1 = 0; var arc2 = 1;
            if (startX > endX) {
                arc1 = 1;
                arc2 = 0;
            }
            // draw tha pipe-like path
            // 1. move a bit down, 2. arch,  3. move a bit to the right, 4.arch, 5. move down to the end
            path.attr("d",  "M"  + startX + " " + startY +
                " V" + (startY + delta) +
                " A" + delta + " " +  delta + " 0 0 " + arc1 + " " + (startX + delta*signum(deltaX)) + " " + (startY + 2*delta) +
                " H" + (endX - delta*signum(deltaX)) +
                " A" + delta + " " +  delta + " 0 0 " + arc2 + " " + endX + " " + (startY + 3*delta) +
                " V" + endY );
        }


        $scope.moved = function(id,top,left){

            //update element position top,left
            var element = $scope.elements[id];
            element.top = top;
            element.left = left;

            //update the connections
            var svg = document.querySelector('#connections-svg');

            //console.log(element)

            for(var i=0;i<element.linksIn.length;i++){

                var path = document.querySelector('#' + element.linksIn[i].connectionId);

                var startElem = document.querySelector('#' +element.linksIn[i].targetId);
                var endElem =  document.querySelector('#' +id);

                connectElements(svg,path,startElem,endElem)
            }
            for(var j=0;j<element.linksOut.length;j++){

                var path = document.querySelector('#' + element.linksOut[j].connectionId);

                var startElem = document.querySelector('#' +id);
                var endElem =  document.querySelector('#' +element.linksOut[j].targetId);

                connectElements(svg,path,startElem,endElem)
            }


        }

        $scope.addProperty = function(propertyType){

            if($scope.selectedEl.type != 'enrichedElement'){
                var index =  $scope.selectedEl.properties.length +1;
                $scope.selectedEl.properties.push({name:"property" + index,type:"text"})

                //update the height of the element
                $scope.selectedEl.height = $scope.selectedEl.height+28
            }
            else {
                if(propertyType === "input")  {
                    var index =  $scope.selectedEl.inputParameters.length +1;
                    $scope.selectedEl.inputParameters.push({name:"input " + index,value:"value"})


                }
                else {
                    var index =  $scope.selectedEl.outputParameters.length +1;
                    $scope.selectedEl.outputParameters.push({name:"output " + index,value:"value"})

                }
                //update the height of the element
                $scope.selectedEl.height = $scope.selectedEl.height+28

            }


        }
        /**
         * Delete property
         * @param propertyName - name of the property
         * @param propertyType - applicable only for enriched element, where type is output/input parameter
         */
        $scope.deleteProperty = function(propertyName,propertyType){

            if($scope.selectedEl.type != 'enrichedElement'){
                var removeIndex = $scope.selectedEl.properties.map(function(item) { return item.name; })
                    .indexOf(propertyName);

                ~removeIndex && $scope.selectedEl.properties.splice(removeIndex, 1);
                //update the height of the element
                $scope.selectedEl.height = $scope.selectedEl.height-28
            }
            else{
                if(propertyType === "input")  {
                    var removeIndex = $scope.selectedEl.inputParameters.map(function(item) { return item.name; })
                        .indexOf(propertyName);

                    ~removeIndex && $scope.selectedEl.inputParameters.splice(removeIndex, 1);
                }
                else {
                    var removeIndex = $scope.selectedEl.outputParameters.map(function(item) { return item.name; })
                        .indexOf(propertyName);

                    ~removeIndex && $scope.selectedEl.outputParameters.splice(removeIndex, 1);
                }

                //update the height of the element
                $scope.selectedEl.height = $scope.selectedEl.height-28
            }

        }

        $scope.connectionMouseDown = function(event,link){
            console.log("connection click!!!")

        }







        $scope.keyUp = function (evt) {


//            if (evt.keyCode === deleteKeyCode) {
//                //
//                // Delete key.
//                //check which element is on focus
//
//                if(document.activeElement.tagName.toLowerCase() === 'input'){
//                    updateElWidth()
//                }
//                //$scope.$$childHead.deleteSelectedElement()
//            }

            // ....
        };

        //LOCAL FUNCTIONS
        function showProperties(elementId){
            var element = $scope.elements[elementId];

           // console.log(element)
            //assigned current element as selected
            $scope.selectedEl = element;
            $scope.selectedElement = true;



            switch (element.type) {
                case 'simpleElement':

                    break;
                case 'enrichedElement':
                    break;
                default:
            }

        }

        $scope.deleteSelectedElement = function(){
            //console.log("Delete element " + $scope.selectedEl.id)

            delete $scope.elements[$scope.selectedEl.id]
            $scope.selectedEl = null
            $scope.selectedElement = false;


        }

//         Dialogs
        $scope.customFullscreen = false;

        $scope.showConnectionDialog = function($event,elementId){


            //console.log(elementId)
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'connectionDialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                clickOutsideToClose:true,
                fullscreen: $scope.customFullscreen,
                windowClass: 'zindex',
                resolve: {
                    elementId: function () {
                        return elementId;
                    },
                    elements:function(){
                        return $scope.elements;
                    }
                } // Only for -xs, -sm breakpoints.
            })
                .then(function(answer) {

                   if(answer != undefined){



                    //Connection done

                    var svg = document.querySelector('#connections-svg');
                    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d','M0 0')
                    path.setAttribute('stroke-width','2px')
                    path.setAttribute('class','connection')
                    path.setAttribute('d','M0 0')
                    //generate unique connection id
                    var connectionId = 'conn-' +  uuid.new()
                    path.setAttribute('id',connectionId)

                    svg.appendChild(path)


                    var startElem = document.querySelector('#' +elementId);
                    var endElem =  document.querySelector('#' +answer);



                    //create connection
                    $scope.elements[elementId].linksOut.push({targetId:answer,connectionId:connectionId})


                    if($scope.elements[answer].type === "enrichedElement"){

                        var inputs = [];
                        for(var i=0;i<$scope.elements[answer].inputParameters.length;i++){
                            if($scope.elements[answer].inputParameters[i].field_name != ""){
                                inputs.push({param:$scope.elements[answer].inputParameters[i].name,value:$scope.elements[answer].inputParameters[i].field_name})
                            }
                        }
                        $scope.elements[answer].linksIn.push({targetId:elementId,connectionId:connectionId, inputs:inputs})
                        console.log($scope.elements[answer])
                    }
                    else {
                        $scope.elements[answer].linksIn.push({targetId:elementId,connectionId:connectionId})
                    }



                    connectElements(svg,path,startElem,endElem);

                   }

                }, function() {
                    //Connection cancel
                });
        }



        function DialogController($scope, $mdDialog, elementId,elements) {

            $scope.elementId = elementId;
            $scope.elements = elements;
            $scope.selectedItem;

            $scope.getSelectedItem = function(){
                if ($scope.selectedItem !== undefined) {
                    return "You have selected: Element " + $scope.selectedItem.name;
                } else {
                    return "Please select an element";
                }
            }

            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
                if(answer !== undefined){
                    $mdDialog.hide(answer);
                }

            };
        }


        $scope.loadContextModel = function(){
            var clientId = localStorage.getItem("clientId");
            $http.get($scope.URL + "/models/" +clientId, null).then(function successCallback(response) {

                console.log(response.status)
                if(response.status === 200){
                    console.log(response.data)

                    //show load context model dialog
                    //console.log(elementId)
                    $mdDialog.show({
                        controller: loadCMDialogController,
                        templateUrl: 'loadModelsDialog.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose:true,
                        fullscreen: $scope.customFullscreen,
                        windowClass: 'zindex',
                        resolve: {
                            models: function () {
                                return response.data.models;
                            }
                        } // Only for -xs, -sm breakpoints.
                    })
                        .then(function(answer) {
                            console.log(answer)

                            //Connection done
                            if(answer != "cancel"){
                               loadElements(answer)
                            }


                        }, function() {
                            //Connection cancel
                        });

                }

            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log("Data send unsuccessfully")
            });
        }

        function loadCMDialogController($scope, $mdDialog, models){
            $scope.models = models;
            $scope.selectedModel;

            $scope.getSelectedModel = function(){
                if ($scope.selectedModel !== undefined) {
                    return "Selected model is " + $scope.selectedModel.name;
                } else {
                    return "Please select the model";
                }
            }

            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
                if(answer !== undefined){
                    $mdDialog.hide(answer);
                }

            };

        }

        function loadElements(model){

            $scope.elements = {}
            for (var i =0;i<model.elements.length;i++){
                var element = JSON.parse(model.elements[i]);
                $scope.elements[element.id] = element;
            }

        }


        $scope.saveContextModel = function(){

            showSavingDialog();

        }

        function showSavingDialog(){
            $mdDialog.show({
                controller: savingDialogController,
                templateUrl: 'savingDialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose:true,
                fullscreen: $scope.customFullscreen,
                windowClass: 'zindex'
            })
                .then(function(answer) {

                    console.log(answer);

                    if(answer != "cancel"){

                        //for the application developer
                        var jsondata = [];
                        //all elements for the configuration service
                        var elements = []
                        for(var elId in $scope.elements){
                            var data = [];
                            //this is for the application developer
                            if($scope.elements[elId].type === "simpleElement"){
                                for(var j =0; j<$scope.elements[elId].properties.length;j++){
                                    data.push({name:$scope.elements[elId].properties[j].name,value:"some value" })
                                }
                                jsondata.push({id:elId,data:data})
                            }

                            elements.push(angular.toJson($scope.elements[elId]))
                        }
                        var clientId = uuid.new();

                        localStorage.setItem("clientId",clientId);
                        var modelId = uuid.new();

                        var result = {clientId:clientId,modelId:modelId,timestamp:"UNIX timestamp in milliseconds",data:jsondata};


                        var configuration_data = {elements:elements,name:answer,clientId:clientId,modelId:modelId, timestamp:new Date()};



                        saveText( JSON.stringify(result), "data-structure-example.json" );
                        var readme = "This file explains the use of contextualization service by your mobile application or third party application.\n" +
                                     "The data should be collected from your mobile app and send in a certain format.\n" +
                                     "The file data-structure-example.json provides an example of how the data structure should look like when you send it from your app to the collect data microservice.\n"+
                                      "It contains:\n" +
                                        "- clientId is an identificator of your app that will be used by contextulization service for doing context analysis.\n" +
                                        "- modelId is an indetificator of your context model that you have created for your data\n" +
                                        "- data is json array of collected data. OBS! each data should have a timestamp in milliseconds\n" +
                                        "- timestamp is UNIX timestamp when the data were collected\n"+
                                      "The data should be send to CMDataCollectionMicroservice by using the following API request:\n" +
                                       "description: send data\n"+
                                       "Endpoint: http://localhost:3002/data\n" +
                                       "HTTP Method: POST\n"+
                                       "oAuth: not required";


                        saveText( readme, "README.txt" );
                        sendDataToServer(JSON.stringify(configuration_data))
                    }

                }, function() {
                    //Connection cancel
                    console.log("conection canceled!!!")
                });
        }

        function savingDialogController($scope, $mdDialog){
            $scope.model;

            $scope.getModelName = function(){
                if ($scope.model !== undefined) {
                    return "Model name is " + $scope.model.name;
                } else {
                    return "Please enter the name of the context model";
                }
            }

            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
                if(answer !== undefined){
                    $mdDialog.hide(answer);
                }

            };
        }

        function saveText(text, filename){
            var a = document.createElement('a');
            a.setAttribute('href', 'data:text/json;charset=utf-u,'+encodeURIComponent(text));
            a.setAttribute('download', filename);
            a.click()
        }

        function sendDataToServer(data){


            $http.post($scope.URL + "/configuration", data,null).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                console.log("Data send successfully")
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log("Data send unsuccessfully")
            });
        }

    }])

    .controller('createScenario', ['$scope', function ($scope) {
        $scope.name = '';
        $scope.edit = true;
        $scope.error = false;
        $scope.incomplete = false;

        $scope.createScenario = function (name) {
            console.log(name);
            if (name == 'new') {
                $scope.edit = true;
                $scope.incomplete = true;
                $scope.name = '';

            } else {
                $scope.edit = false;
                $scope.name = $scope.users[id - 1].fName;

            }
        };

        $scope.$watch('name', function () {
            $scope.test();
        })

        $scope.test = function () {
            if ($scope.passw1 !== $scope.passw2) {
                $scope.error = true;
            } else {
                $scope.error = false;
            }
            $scope.incomplete = false;
            if ($scope.edit && (!$scope.fName.length || !$scope.lName.length || !$scope.passw1.length || !$scope.passw2.length)) {
                $scope.incomplete = true;
            }
        };
    }]);



