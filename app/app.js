'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
        'ngRoute',
        'ngMaterial',
        'ngAnimate',
        'myApp.viewContextConfig',
        'myApp.version',
        'ui.bootstrap'
    ]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/viewContextConfig'});

    }]).
    directive('moveable',function ($document) {
        return {
            restrict: 'C',
            scope: {
                moved: '&'
            },
            link: function (scope, element, attr) {
                var startX = 0, startY = 0, x = 0, y = 0;


                element.on('mousedown', function (event) {

                    // Prevent default dragging of selected content
                    event.preventDefault();

                    // Stops some browsers from redirecting.
                    if (event.stopPropagation) event.stopPropagation();


                    //console.log(this.clientWidth)
                    //console.log(this.clientHeight)

                    //console.log(this.getBoundingClientRect().top + ";" +this.getBoundingClientRect().left)




                    startX = event.screenX - x;
                    startY = event.screenY - y;
                    //console.log(startX + ';' +startY)

                   $document.on('mousemove', mousemove);
                   $document.on('mouseup', mouseup);
                });

                element.on('mouseover',function (event){
                    event.preventDefault();


                   //SHOW the Circles around div

                })


                function mousemove(event) {
                    y = event.screenY - startY;
                    x = event.screenX - startX;
                    element.css({
                        top: y + 'px',
                        left: x + 'px'
                    });
                    scope.moved({top:y,left:x})

                }

                function mouseup() {
                    $document.off('mousemove', mousemove);
                    $document.off('mouseup', mouseup);
                }
            }}

    }).directive('droppable', ['$rootScope', 'uuid', '$document', '$compile', function ($rootScope, uuid, $document, $compile) {
        return {
            scope: {
                drop: '&',
                bin: '='
            },
            restrict: 'C',
            link: function (scope, element, attr) {

                var startX = 0, startY = 0, x = 0, y = 0;

                var dragX = 0, dragY=0;
                var dragStartX = 0,dragStartY = 0;

                element.on('mousedown', function (event) {
                    //console.log('mousedown on Canvas')
                    //console.log(element)
                    // Prevent default dragging of selected content
                    event.preventDefault();


                    startX = event.screenX - x;
                    startY = event.screenY - y;


                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);


                });

                function mousemove(event) {
                //    console.log('mousemove')
                y = event.screenY - startY;
                x = event.screenX - startX;
                    if(x<200) {
                        element.children(':first').css({
                            top: y + 'px',
                            left:  x + 'px'
                        });
                   }


                }

                function mouseup() {
                    $document.off('mousemove', mousemove);
                    $document.off('mouseup', mouseup);
                }


                // again we need the native object
                var el = element[0];

                el.addEventListener(
                    'dragover',
                    function (e) {
                        e.dataTransfer.dropEffect = 'move';

                        //console.log("dragover");
                        // allows us to drop
                        if (e.preventDefault) e.preventDefault();
                        this.classList.add('over');

                        e = e || window.event;
                        dragX = e.pageX-dragStartX;
                        dragY = e.pageY-dragStartY;

                        //console.log("X: "+dragX+" Y: "+dragY);

                        return false;
                    },
                    false
                );

                el.addEventListener(
                    'dragenter',
                    function (e) {
                        //console.log("dragenter");
                        this.classList.add('over');
                        dragStartX = e.pageX -x,dragStartY = e.pageY-y;

                        return false;
                    },
                    false
                );

                el.addEventListener(
                    'dragleave',
                    function (e) {
                        //console.log("dragleave");
                        this.classList.remove('over');
                        return false;
                    },
                    false
                );

                el.addEventListener(
                    'drop',
                    function (e) {
                        // Stops some browsers from redirecting.
                        if (e.stopPropagation) e.stopPropagation();
                        ////console.log("drop");
                        this.classList.remove('over');


//                   var item = document.getElementById(e.dataTransfer.getData('Text')).cloneNode(true);
//                    var binId = uuid.new();
//
//                    item.classList.remove('drag');
//                    item.classList.remove('element')
//
//                    item.classList.remove('draggable')
//                    item.setAttribute('draggable','false')
//
//                    item.classList.add('diagramObject')
//
//                    item.classList.add('moveable')
//
//                    item.setAttribute('id',binId)
//
//                    scope.drop({dragEl:item.id});
//
//                    var ell = $compile(item)(scope);
//                    //element.append(ell)
//
//                    this.appendChild(item);
                        var binId = 'el-'+ uuid.new();

                        var item = angular.element(document.getElementById(e.dataTransfer.getData('Text')));

                        /*
                        var newElement = item.clone(true)


                        var binId = uuid.new();
                        newElement.attr('id', binId);
                        newElement.attr('draggable', false)
                        newElement.addClass('moveable diagramObject')
                        newElement.removeClass('drag element draggable')
                       // newElement.attr('click', 'click(elementId)')

                        newElement.css({
                           top: dragY + 'px',
                           left:  dragX + 'px'
                        });



                        //Add element to DOM
                        var compiledEl = $compile(newElement)(scope)
                        element.append(compiledEl)  */
                        //Fire a drop event
                        scope.drop({id: binId,type:item.attr('element-type'),x:dragX,y:dragY,w:item.prop('offsetWidth'),h:item.prop('offsetHeight')})


                        return false;
                    },
                    false
                );

            }

        };
    }]).
    directive('draggable', ['$rootScope', 'uuid', function ($rooScope, uuid) {
        return {
            restrict: 'C', link: function (scope, element, attr) {


                // this gives us the native JS object
                var el = element[0];

                el.draggable = true;


                el.addEventListener(
                    'dragstart',
                    function (event) {
                        //console.log("dragstart");
                        event.dataTransfer.effectAllowed = 'move';
                        var id = this.id;
                        if (!id) {
                            id = 'el-'+ uuid.new()
                            this.id = id
                        }
                        event.dataTransfer.setData('Text', this.id);


                        this.classList.add('drag');
                        return false;
                    },
                    false
                );

                el.addEventListener(
                    'dragend',
                    function (event) {
                        //console.log("dragend");
                        this.classList.remove('drag');


                        return false;
                    },
                    false
                );

            }

        }
    }]).directive('outerHeight', function(){
        return{
            restrict:'A',
            link: function(scope, element){
                //using outerHeight() assumes you have jQuery
                //use Asok's method in comments if not using jQuery
                //console.log(angular.element(element).prop('offsetHeight'));
            }
        };
    })

    .factory('uuid', function () {
        var svc = {
            new: function () {
                function _p8(s) {
                    var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                    return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
                }

                return _p8() + _p8(true) + _p8(true) + _p8();
            },

            empty: function () {
                return '00000000-0000-0000-0000-000000000000';
            }
        };

        return svc;
    });
;


