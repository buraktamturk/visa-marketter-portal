'use strict';

const angular = require('angular'),
    prettysize = require('prettysize');

require('angular-img-cropper');

export default angular
    .module('sarotty.cropper', [
        'angular-img-cropper',
        require('ng-dialog')
    ])
    .filter('prettysize', function () {
        return prettysize;
    })
    .factory('uploader', function ($http, $ottp) {
        'ngInject';

        class Uploader {
            constructor(data) {
                this.iptal = null;

                this.id = data && data.id;
                this.access_url = data && data.access_url;
                this.name = data && data.name;
                this.size = data && data.size;

                this.type = this.id ? 3 : 1;
            }

            async upload(name, contentType, blob, second) {
                console.log('upload called ', blob);

                this.cancel();

                this.name = name;

                var previous_type = this.type,
                    previous_id = this.id,
                    previous_access_url = this.access_url,
                    previous_img = this.img,
                    previous_img_url = this.img_url,
                    previous_pr = this.pr;

                this.iptal = Promise.defer();

                try {
                    this.img = blob;
                    this.img_url = URL.createObjectURL(blob);
                    this.type = 2;
                    this.pr = {
                        min: second ? 1 : 0,
                        max: 2
                    };

                    var file = await $ottp({
                        method: 'PUT',
                        endpoint: 'main',
                        path: `file/${name}`,
                        data: blob,
                        timeout: this.iptal.promise,
                        merge: false,
                        headers: {
                            'Content-Type': contentType
                        },
                        uploadEventHandlers: {
                            progress: (event) => {
                                this.pr = {
                                    min: (second ? event.total : 0) + event.loaded,
                                    max: event.total * (second ? 2 : 1)
                                };
                            }
                        }
                    });

                    this.type = 3;
                    this.id = file.id;
                    this.access_url = file.access_url;
                } catch (e) {
                    this.type = previous_type;
                    this.id = previous_id;
                    this.access_url = previous_access_url;
                    this.img = previous_img;
                    this.img_url = previous_img_url;
                    this.pr = previous_pr;

                    throw e;
                }
            }

            remove() {
                this.cancel();
                this.img = null;
                this.img_url = null;
                this.id = null;
                this.access_url = null;
                this.type = 1;
            }

            cancel() {
                if (this.iptal) {
                    this.iptal.resolve();
                    this.iptal = null;
                }
            }

            toJSON() {
                return this.type == 3 ? {
                    id: this.id
                } : null;
            }
        };

        return function (data) {
            return data && (data instanceof Uploader) ? data : new Uploader(data);
        };
    })
    .directive('sweetupload', function () {
        return {
            restrict: 'A',
            scope: {
                sweetupload: '=',
                desc: '@',
                accept: '@'
            },
            transclude: false,
            template: `<div>
              <input type="file" style="display:none" accept="{{accept}}" />
              <div ng-switch on="sweetupload.type">
                  <div ng-switch-when="1"><a href class="btn btn-primary" ng-click="sec()">Select File</a></div>
                  <div ng-switch-when="2"><a href class="btn btn-outline-danger" ng-click="sweetupload.cancel()">Cancel</a> <a href>{{sweetupload.name}}</a><br />{{sweetupload.pr.min | prettysize}}/{{sweetupload.pr.max | prettysize}} {{(sweetupload.pr.min/sweetupload.pr.max*100) | number : 0}}%</div>
                  <div ng-switch-when="3" class="upload_done"><a href class="btn btn-danger" ng-click="sweetupload.remove()">Sil</a> <a href="{{sweetupload.access_url}}">{{sweetupload.name}}</a> ({{sweetupload.size | prettysize}})</div>
              </div>
           </div>`,
            link(scope, element, attrs) {
                var file_input = element.find('input[type=file]');
                file_input.on('change', function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();

                    var _file = file_input[0].files[0];

                    var type = _file.type;
                    var ext = _file.name.split(".")[1];

                    if (ext == "aepx") {
                        type = "text/xml";
                    } else if (ext == "tar") {
                        type = "application/x-tar";
                    }

                    scope.sweetupload.upload(_file.name, type, _file);

                    file_input
                        .attr("value", "")
                        .val("");
                });

                scope.sec = function () {
                    file_input.trigger('click');
                };
            }
        };
    })
    .directive('cropper', function($parse) {
       "use strict";

       return {
           restrict: 'E',
           scope: {
             size: '=',
             data: '=',
             format: '='
           },
           template: `
          <div class="rcrop">
            <input type="file" style="display:none" />
            <div class="area" ng-style="{'paddingBottom': (size.h / size.w * 100) + '%'}">
              <div>
                <a href ng-click="show($event)">
                  <div ng-if="!data.img && !data.id">
                    {{size.w}} x {{size.h}}
                  </div>
                  <div ng-if="data.img || data.id">
                    <img ng-src="{{data.img_url || data.access_url}}" />
                  </div>
                </a>
              </div>
            </div>
            <div class="back mt-1" ng-if="data.type == 2 || data.type == 3" ng-switch on="data.type">
              <div class="btm" ng-switch-when="1000"><a style="visiblity:none" href ng-click="random()" class="btn btn-outline-info btn-sm">Random</a></div>
              <div class="btm2" ng-switch-when="2"><a href class="btn-iptal btn btn-danger btn-sm" ng-click="data.cancel()">İptal</a><progress class="progress progress-success progress-extra-small" value="{{data.pr.min}}" max="{{data.pr.max}}"></progress></div>
              <div class="btm" ng-switch-when="3"><a href class="btn btn-danger btn-sm" ng-click="data.remove()">Sil</a></div>
            </div>
           </div>`,
           link(scope, element, attrs) {
             var file_input = element.find('input[type=file]');

             file_input.on('change', function(event) {
               event.preventDefault();
               event.stopImmediatePropagation();

               var _file = file_input[0].files[0];
               console.log(_file);

               var reader = new FileReader();
               reader.onload = function(evt) {
                 scope.$apply(function($scope){
                   scope.image(evt.target.result);
                 });
               };
               reader.readAsDataURL(_file);

               file_input
                .attr("value", "")
                .val("");
             })

             scope.show = function($event) {
               $event.preventDefault();

               if($event.metaKey || $event.ctrlKey) {
                 scope.random();
               } else {
                 file_input
                    .trigger('click');
               }
             };
           },
           controller($scope, ngDialog, $http, $ottp, uploader) {
             'ngInject';

             var setter, data;

             function dataURItoBlob(dataURI) {
                 // convert base64/URLEncoded data component to raw binary data held in a string
                 var byteString;
                 if (dataURI.split(',')[0].indexOf('base64') >= 0)
                     byteString = atob(dataURI.split(',')[1]);
                 else
                     byteString = unescape(dataURI.split(',')[1]);

                 // separate out the mime component
                 var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                 // write the bytes of the string to a typed array
                 var ia = new Uint8Array(byteString.length);
                 for (var i = 0; i < byteString.length; i++) {
                     ia[i] = byteString.charCodeAt(i);
                 }

                 return new Blob([ia], {type:mimeString});
             }

             async function cropImage(data, size, type) {
               var data = await ngDialog.open({
                 template: `
      <div class="modal-body">
        <div class="img-crop">
          <canvas width="465" height="348" image-cropper image="ngDialogData.img" cropped-image="cropped_img" crop-width="ngDialogData.size.w" crop-height="ngDialogData.size.h" keep-aspect="true" touch-radius="30" crop-area-bounds="bounds"></canvas>
        </div>
      </div>
      <div class="modal-footer">
        <a href class="btn btn-secondary btn-sm" ng-click="closeThisDialog({ ok: 0 })">Close</a>
        <a href ng-click="closeThisDialog({ ok: 1, data: cropped_img })" class="btn btn-primary btn-sm">Crop</a>
      </div>
                 `,
                 className: 'ngdialog-theme-plain',
                 plain: true,
                 data: { img: data, size },
                 controller() {
                   'ngInject';

                 },
                 controllerAs: 'ctrl'
               }).closePromise;

               if(!data.value.ok) {
                 throw new Error('User Cancel');
               }

               if(!type || type == "png") {
                 return dataURItoBlob(data.value.data);
               } else if(type == "jpg") {
                 console.log('jpg handler!!');
                 var blob = dataURItoBlob(data.value.data);

                 return await (new Promise((resolve, reject) => {
                   var canvas = document.createElement('canvas');
                   var ctx = canvas.getContext('2d');
                   var img = new Image();

                   img.onload = function(){
                     canvas.width=img.width;
                     canvas.height=img.height;
                     ctx.drawImage(img, 0, 0);
                     canvas.toBlob(function(blob) {
                       resolve(blob);
                     }, 'image/jpeg', 1);
                   };

                   img.src = URL.createObjectURL(blob);
                 }));

               } else {
                 throw new Error("invalid format!");
               }
             }

             var iptal;

             $scope.image = async function(blob) {
               var ddd = await cropImage(blob, $scope.size, $scope.format);

               await $scope.data.upload($scope.format == "jpg" ? "image.jpg" : "image.png", $scope.format == "jpg" ? "image/jpeg" : "image/png", ddd);
             };

             $scope.random = async function() {
               await $scope.data.random($scope.format, $scope.size.w, $scope.size.h);
             };

             $scope.remove = function() {
               $scope.img = null;
               $scope.img_url = null;
               $scope.pr = null;
               $scope.type = 1;
             };

             $scope.type = 1;
           },
           controllerAs: 'ctrl2'
       };
   })
    .name;
