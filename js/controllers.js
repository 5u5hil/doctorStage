var publisher;
var session;
var subscriber;
angular.module('your_app_name.controllers', [])

        .controller('AuthCtrl', function ($scope, $state, $ionicConfig, $rootScope) {
            $rootScope.interface = window.localStorage.setItem('interface_id', '8');
            if (window.localStorage.getItem('id') != null) {
                $rootScope.userLogged = 1;
                $rootScope.username = window.localStorage.getItem('fname');
                $rootScope.userimage = window.localStorage.getItem('image');

            }
        })

        // APP
        .controller('AppCtrl', function ($scope, $http, $state, $ionicConfig, $rootScope, $ionicLoading, $timeout, $ionicHistory) {
            $rootScope.imgpath = domain + "/public/frontend/user/";
            $rootScope.attachpath = domain + "/public";
            $scope.userId = window.localStorage.getItem('id');
            $scope.userType = 'doctor';
            $scope.action = 'logout';
            $scope.interface = window.localStorage.getItem('interface_id');
            if (window.localStorage.getItem('id') != null) {
                $rootScope.userLogged = 1;
                $rootScope.username = window.localStorage.getItem('fname');
                $rootScope.userimage = window.localStorage.getItem('image');
            }
            $ionicLoading.show({template: 'Loading..'});
            $http({
                method: 'GET',
                url: domain + 'get-dr-sidemenu',
                params: {id: $scope.userId, interface: $scope.interface}
            }).then(function successCallback(response) {
                if (response.data) {
                    $scope.menuItem = response.data.menuItem;
                    $ionicLoading.hide();
                } else {
                }
            }, function errorCallback(response) {
                // console.log(response);
            });

            $scope.logout = function () {
                $http({
                    method: 'GET',
                    url: domain + 'get-login-logout-log',
                    params: {userId: window.localStorage.getItem('id'), interface: $scope.interface, type: $scope.userType, action: $scope.action}
                }).then(function successCallback(response) {
                }, function errorCallback(e) {
                    console.log(e);
                });
                $ionicLoading.show({template: 'Logging out....'});
                $http({
                    method: 'GET',
                    url: domain + 'doctors/doctor-logout',
                    params: {docId: window.localStorage.getItem('id')}
                }).then(function successCallback(response) {
                    window.localStorage.clear();
                    $rootScope.userLogged = 0;
                    $rootScope.$digest;
                    $timeout(function () {
                        $ionicLoading.hide();
                        $ionicHistory.clearCache();
                        $ionicHistory.clearHistory();
                        $ionicHistory.nextViewOptions({disableBack: true, historyRoot: true});
                        $state.go('auth.walkthrough', {}, {reload: true});
                    }, 30);
                }, function errorCallback(e) {
                    console.log(e);
                });
            };
        })

        //LOGIN
        .controller('LoginCtrl', function ($scope, $http, $state, $templateCache, $q, $rootScope, $ionicLoading, $timeout) {
            $scope.interface = window.localStorage.getItem('interface_id');
            $scope.userType = 'doctor';
            $scope.action = 'login';
            $scope.doLogIn = function () {
                $ionicLoading.show({template: 'Loading...'});
                var data = new FormData(jQuery("#loginuser")[0]);
                $.ajax({
                    type: 'POST',
                    url: domain + "chk-dr-user",
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function (response) {
                        console.log("@@@@" + response.fname);
                        if (angular.isObject(response)) {
                            $scope.loginError = '';
                            $scope.loginError.digest;
                            store(response);
                            $rootScope.userLogged = 1;
                            $rootScope.username = response.fname;
                            $rootScope.userimage = response.image;
                            $ionicLoading.hide();
                            $http({
                                method: 'GET',
                                url: domain + 'get-login-logout-log',
                                params: {userId: window.localStorage.getItem('id'), interface: $scope.interface, type: $scope.userType, action: $scope.action}
                            }).then(function successCallback(response) {
                            }, function errorCallback(e) {
                                console.log(e);
                            });
                            try {
                                window.plugins.OneSignal.getIds(function (ids) {
                                    console.log('getIds: ' + JSON.stringify(ids));
                                    if (window.localStorage.getItem('id')) {
                                        $scope.userId = window.localStorage.getItem('id');
                                    } else {
                                        $scope.userId = '';
                                    }

                                    $http({
                                        method: 'GET',
                                        url: domain + 'notification/insertPlayerId',
                                        params: {userId: $scope.userId, playerId: ids.userId, pushToken: ids.pushToken}
                                    }).then(function successCallback(response) {
                                        if (response.data == 1) {
                                            //  alert('Notification setting updated');

                                        }
                                    }, function errorCallback(e) {
                                        console.log(e);

                                    });
                                });
                            } catch (err) {

                            }
                            $state.go('app.homepage');
                        } else {
                            $rootScope.userLogged = 0;
                            $scope.loginError = response;
                            $scope.loginError.digest;
                            $ionicLoading.hide();
                            $timeout(function () {
                                $scope.loginError = response;
                                $scope.loginError.digest;
                            })
                        }
                        $rootScope.$digest;
                    },
                    error: function (e) {
                        console.log(e.responseText);
                    }
                });
            };
            $scope.user = {};
            $scope.user.email = "";
            $scope.user.pin = "";
            // We need this for the form validation
            $scope.selected_tab = "";
            $scope.$on('my-tabs-changed', function (event, data) {
                $scope.selected_tab = data.title;
            });
        })

        .controller('EvaluationCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('PatientChatCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('MyCtrl', function ($scope, $ionicTabsDelegate) {
            $scope.selectTabWithIndex = function (index) {
                $ionicTabsDelegate.select(index);
            }
        })

        .controller('CreatedbyuCtrl', function ($scope, $http, $stateParams, $ionicModal, $state) {
            $scope.patientId = $stateParams.id;
            $scope.shared = 0;
            $scope.catIds = [];
            $scope.catId = [];
            $scope.userId = get('id');
            $scope.docId = get('id');
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-patient-record-category',
                params: {userId: $scope.userId, patientId: $stateParams.id, interface: $scope.interface, shared: $scope.shared}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.categories = response.data.categories;
                $scope.doctrs = response.data.doctrs;
                $scope.userRecords = response.data.recordCount;
                $scope.patient = response.data.patient;
            }, function errorCallback(e) {
                console.log(e);
            });
            $scope.getIds = function (id) {
                console.log(id);
                if ($scope.catId[id]) {
                    $scope.catIds.push(id);
                } else {
                    var index = $scope.catIds.indexOf(id);
                    $scope.catIds.splice(index, 1);
                }
                console.log($scope.catIds);
            };
            $scope.getDocId = function (id) {
                console.log(id);
                $scope.docId = id;
            };
            //Delete all Records by category
            $scope.delete = function () {
                if ($scope.catIds.length > 0) {
                    var confirm = window.confirm("Do you really want to delete?");
                    if (confirm) {
                        console.log($scope.catIds);
                        $http({
                            method: 'POST',
                            url: domain + 'doctrsrecords/delete-all',
                            params: {ids: JSON.stringify($scope.catIds), userId: $scope.userid, shared: $scope.shared}
                        }).then(function successCallback(response) {
                            alert("Records deleted successfully!");
                            $state.go('app.createdbyu', {id: $scope.patientId}, {reload: true});
                        }, function errorCallback(e) {
                            console.log(e);
                        });
                    }
                } else {
                    alert("Please select records to delete!");
                }
            };
            //Share all records by Category
            $scope.share = function () {
                if ($scope.catIds.length > 0) {
                    if ($scope.patientId != '') {
                        var confirm = window.confirm("Do you really want to share?");
                        if (confirm) {
                            console.log($scope.catIds);
                            $http({
                                method: 'POST',
                                url: domain + 'doctrsrecords/share-all',
                                params: {ids: JSON.stringify($scope.catIds), userId: $scope.userId, patientId: $scope.patientId, docId: $scope.docId, shared: $scope.shared}
                            }).then(function successCallback(response) {
                                console.log(response);
                                if (response.data == 'Success') {
                                    alert("Records shared successfully!");
                                    window.location.reload();
                                    //$state.go('app.createdbyu', {id: $scope.patientId}, {reload: true});
                                }
                            }, function errorCallback(e) {
                                console.log(e);
                            });
                        }
                    } else {
                        alert("Please select doctor to share with!");
                    }
                } else {
                    alert("Please select records to share!");
                }
            };
            $ionicModal.fromTemplateUrl('share', {
                scope: $scope,
            }).then(function (modal) {
                $scope.modal = modal;
            });

            $scope.submitmodal = function () {
                console.log($scope.catIds);
                $scope.modal.hide();
            };
        })

        .controller('AdsCtrl', function ($scope, $http, $state, $ionicActionSheet, AdMob, iAd, $ionicModal) {
            $scope.interface = window.localStorage.getItem('interface_id');
            $scope.userId = get('id');
            // Load the modal from the given template URL
            $ionicModal.fromTemplateUrl('addrecord.html', function ($ionicModal) {
                $scope.modal = $ionicModal;
                $scope.getCategory = function () {
                    $http({
                        method: 'GET',
                        url: domain + 'records/get-doctor-record-categories',
                        params: {userId: $scope.userId, interface: $scope.interface}
                    }).then(function successCallback(response) {
                        $scope.cats = response.data;
                        $scope.modal.show();
                        // angular.forEach(response.data, function (value, key) {
                        // $scope.cats.push({text: value.category, id: value.id});
                        // });
                    }, function errorCallback(response) {
                        console.log(response);
                    });
                };
                $scope.addRecord = function ($ab) {
                    $state.go('app.add-category', {'id': $ab}, {reload: true});
                    $scope.modal.hide();
                };
            }, {
                // Use our scope for the scope of the modal to keep it simple
                scope: $scope,
                // The animation we want to use for the modal entrance
                animation: 'slide-in-up'
            });
        })

        .controller('AddRecordCtrl', function ($scope, $http, $state, $stateParams, $compile, $ionicModal, $ionicHistory, $filter, $timeout, $ionicLoading, $cordovaCamera, $cordovaFile, $rootScope) {
            $scope.interface = window.localStorage.getItem('interface_id');

            $scope.images = [];
            $scope.image = [];
            $scope.tempImgs = [];
            $scope.prescription = 'Yes';
            $scope.coverage = 'Family Floater';
            $scope.probstatus = 'Current';
            $scope.taskstatus = 'Onetime';
            $scope.assignfor = 'Self';
            $scope.conId = [];
            $scope.conIds = [];
            $scope.selConditions = [];
            $scope.curTime = new Date();
            $scope.curTimeo = $filter('date')(new Date(), 'HH:mm');
            $scope.endDate = '0000-00-00';
            $scope.endTime = $filter('date')($scope.endTime, 'HH:mm');
            //$scope.curT = new Date()$filter('date')(new Date(), 'H:i');
            $scope.userId = get('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.categoryId = $stateParams.id;
            $scope.fields = [];
            $scope.problems = [];
            $scope.doctrs = [];
            $scope.day = '';
            $scope.meals = [{time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}];
            $scope.mealDetails = [];
            $scope.dayMeal = [];
            $ionicLoading.show({template: 'Loading...'});
            $http({
                method: 'GET',
                url: domain + 'records/add',
                params: {id: $stateParams.id, patientId: $scope.patientId, userId: $scope.userId, interface: $scope.interface}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.record = response.data.record;
                $scope.fields = response.data.fields;
                $scope.problems = response.data.problems;
                $scope.doctrs = response.data.doctrs;
                $scope.category = $stateParams.id;
                $scope.conditions = response.data.knownHistory;
                $scope.langtext = response.data.langtext;
                $scope.language = response.data.lang.language;
                if ($scope.category == '6') {
                    angular.forEach($scope.fields, function (value, key) {
                        if (value.field == 'Coverage') {
                            $scope.coverage = 'Family Floater';
                        }
                    });
                }
                if ($scope.category == '14') {
                    angular.forEach($scope.fields, function (value, key) {
                        if (value.field == 'Status') {
                            console.log(value.field);
                            $scope.probstatus = 'Current';
                        }
                    });
                }
                $ionicLoading.hide();
            }, function errorCallback(response) {
                console.log(response);
            });
            $scope.getCondition = function (id, con) {
                console.log(id + "==" + con);
                var con = con.toString();
                if ($scope.conId[id]) {
                    $scope.conIds.push(id);
                    $scope.selConditions.push({'condition': con});
                } else {
                    var index = $scope.conIds.indexOf(id);
                    $scope.conIds.splice(index, 1);
                    for (var i = $scope.selConditions.length - 1; i >= 0; i--) {
                        if ($scope.selConditions[i].condition == con) {
                            $scope.selConditions.splice(i, 1);
                        }
                    }
                }
                jQuery("#selcon").val($scope.conIds);
                console.log($scope.selConditions);
                console.log($scope.conIds);
            };
            $scope.addOther = function (name, field, val) {
                console.log(name, field, val);
                addOther(name, field, val);
            };
            $scope.addNewElement = function (ele) {
                addNew(ele);
            };
            $scope.submit = function () {
                //console.log(jQuery("#addRecordForm")[0].length);                
                //alert($scope.tempImgs.length);

                if (jQuery("#addRecordForm")[0].length > 2) {
                    $ionicLoading.show({template: 'Adding...'});
                    var data = new FormData(jQuery("#addRecordForm")[0]);
                    callAjax("POST", domain + "records/save", data, function (response) {
                        console.log(response);
                        $ionicLoading.hide();
                        if (angular.isObject(response.records)) {
                            $ionicHistory.nextViewOptions({
                                historyRoot: true
                            });
                            $scope.recIds = response.records.id;
                            var confirm = window.confirm("Do you really want to share?");
                            if (confirm) {
                                console.log($scope.recIds);
                                $http({
                                    method: 'POST',
                                    url: domain + 'doctrsrecords/share',
                                    params: {id: $scope.recIds, userId: $scope.userId, docId: $scope.patientId, shared: 0}
                                }).then(function successCallback(response) {
                                    console.log(response);
                                    if (response.data == 'Success') {
                                        alert("Records shared successfully!");
                                        $state.go('app.records-view', {'id': $scope.categoryId, 'patientId': $scope.patientId, 'shared': 0}, {}, {reload: true});
                                    }
                                }, function errorCallback(e) {
                                    console.log(e);
                                });

                            } else {

                                alert("Record added successfully!");
                                $timeout(function () {
                                    $state.go('app.records-view', {'id': $scope.categoryId, 'patientId': $scope.patientId, 'shared': 0}, {}, {reload: true});
                                }, 1000);
                            }
                        } else if (response.err != '') {
                            alert('Please fill mandatory fields');
                        }
                    });
                }


                function getImgUrl(imageName) {
                    var name = imageName.substr(imageName.lastIndexOf('/') + 1);
                    var trueOrigin = cordova.file.dataDirectory + name;
                    return trueOrigin;
                }
            };

            $scope.getPrescription = function (pre) {
                console.log('pre ' + pre);
                if (pre === ' No') {
                    console.log("no");
                    jQuery('#convalid').addClass('hide');
                } else if (pre === 'Yes') {
                    console.log("yes");
                    jQuery('#convalid').removeClass('hide');
                }
            };
            //Take images with camera
            $scope.takePict = function (name) {
                //console.log(name);
                var camimg_holder = $("#camera-status");
                camimg_holder.empty();
                // 2
                var options = {
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                };
                // 3
                $cordovaCamera.getPicture(options).then(function (imageData) {
                    //alert(imageData);
                    onImageSuccess(imageData);
                    function onImageSuccess(fileURI) {
                        createFileEntry(fileURI);
                    }
                    function createFileEntry(fileURI) {
                        window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
                    }
                    // 5
                    function copyFile(fileEntry) {
                        var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                        var newName = makeid() + name;
                        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (fileSystem2) {
                            fileEntry.copyTo(
                                    fileSystem2,
                                    newName,
                                    onCopySuccess,
                                    fail
                                    );
                        },
                                fail);
                    }
                    // 6
                    function onCopySuccess(entry) {
                        var imageName = entry.nativeURL;
                        $scope.$apply(function () {
                            $scope.tempImgs.push(imageName);
                        });
                        $scope.picData = getImgUrl(imageName);
                        //alert($scope.picData);
                        $scope.ftLoad = true;
                        camimg_holder.append('<button class="button button-positive remove" onclick="removeCamFile()">Remove Files</button><br/>');
                        $('<span class="upattach"><i class="ion-paperclip"></i></span>').appendTo(camimg_holder);
                    }
                    function fail(error) {
                        console.log("fail: " + error.code);
                    }
                    function makeid() {
                        var text = "";
                        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                        for (var i = 0; i < 5; i++) {
                            text += possible.charAt(Math.floor(Math.random() * possible.length));
                        }
                        return text;
                    }
                    function getImgUrl(imageName) {
                        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
                        var trueOrigin = cordova.file.dataDirectory + name;
                        return trueOrigin;
                    }
                }, function (err) {
                    console.log(err);
                });
            };

            $scope.uploadPicture = function () {
                //$ionicLoading.show({template: 'Uploading..'});
                var fileURL = $scope.picData;
                var name = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                options.mimeType = "image/jpeg";
                options.chunkedMode = true;
                var params = {};
//                params.value1 = "someparams";
//                params.value2 = "otherparams";
//                options.params = params;
                var uploadSuccess = function (response) {
                    alert('Success  ====== ');
                    console.log("Code = " + r.responseCode);
                    console.log("Response = " + r.response);
                    console.log("Sent = " + r.bytesSent);
                    //$scope.image.push(name);
                    //$ionicLoading.hide();
                }
                var ft = new FileTransfer();
                ft.upload(fileURL, encodeURI(domain + 'records/upload'), uploadSuccess, function (error) {
                    //$ionicLoading.show({template: 'Error in connecting...'});
                    //$ionicLoading.hide();
                }, options);
            };

            $scope.chkDt = function (dt) {
                console.log(dt);
                console.log($scope.curTime);
                console.log($scope.curTime < dt);
                if (!($scope.curTime < dt)) {
                    alert('End date should be greater than start date.');
                    jQuery('#enddt').val('');
                }
            };

            $scope.check = function (val) {
                console.log(val);
                if ($scope.categoryId == 7) {
                    if (val) {
                        jQuery('#billStatus').val('Paid');
                        jQuery('#billmode').removeClass('hide');
                    } else {
                        jQuery('#billStatus').val('Unpaid');
                        jQuery('#billmode').addClass('hide');
                    }
                }
                if ($scope.categoryId == 3) {
                    if (val) {
                        jQuery('#mediStatus').val('Active');
                    } else {
                        jQuery('#mediStatus').val('Inactive');
                    }
                }
                if ($scope.categoryId == 2) {
                    if (val) {
                        jQuery('#immrcvdate').val('Received');
                        jQuery('#imdtrcv').removeClass('hide');
                        jQuery('.imd').removeClass('hide');
                    } else {
                        jQuery('#immrcvdate').val('To be received');
                        jQuery('#imdtrcv').addClass('hide');
                        jQuery('.imd').addClass('hide');
                    }
                }
                if ($scope.categoryId == 4) {
                    if (val) {
                        jQuery('#proconduct').val('Conducted On');
                        jQuery('#proconon').removeClass('hide');
                        jQuery('.proc').removeClass('hide');
                        jQuery('#proconbef').addClass('hide');
                    } else {
                        jQuery('#proconduct').val('To be conducted');
                        jQuery('#proconon').addClass('hide');
                        jQuery('.proc').addClass('hide');
                        jQuery('#proconbef').removeClass('hide');
                    }
                }
                if ($scope.categoryId == 5) {
                    if (val) {
                        jQuery('#invconduct').val('Conducted');
                        jQuery('#invconon').removeClass('hide');
                        jQuery('.inv').removeClass('hide');
                        jQuery('#invconbef').addClass('hide');
                    } else {
                        jQuery('#invconduct').val('To be conducted');
                        jQuery('#invconon').addClass('hide');
                        jQuery('.inv').addClass('hide');
                        jQuery('#invconbef').removeClass('hide');
                    }
                }
            };

            $scope.rcheck = function (val) {
                console.log(val);
                if ($scope.categoryId == 2) {
                    if (val) {
                        jQuery('#immrepeat').val('Yes');
                        jQuery('#imrpton').removeClass('hide');
                        //jQuery('.imd').removeClass('hide');
                    } else {
                        jQuery('#immrepeat').val('No');
                        jQuery('#imrpton').addClass('hide');
                        //jQuery('.imd').addClass('hide');
                    }
                }
            };

            $scope.shCheck = function (val) {
                console.log(val);
                if ($scope.categoryId == 3) {
                    if (val == '') {
                        jQuery('#prescribeDt').addClass('hide');
                    } else {
                        jQuery('#prescribeDt').removeClass('hide');
                    }
                }
            };

            $scope.radChange = function (prob) {
                console.log(prob);
                if ($scope.categoryId == 14) {
                    if (prob != 'Past') {
                        jQuery('#probend').addClass('hide');
                    } else {
                        jQuery('#probend').removeClass('hide');
                    }
                }
                if ($scope.categoryId == 30) {
                    if (prob != 'Onetime') {
                        jQuery('#endtime').removeClass('hide');
                        jQuery('#enddate').removeClass('hide');
                        jQuery('.taskn').removeClass('hide');

                    } else {
                        jQuery('#endtime').addClass('hide');
                        jQuery('#enddate').addClass('hide');
                        jQuery('.taskn').addClass('hide');

                    }
                }
            };

            $scope.setFile = function (element) {
                $scope.currentFile = element.files[0];
                console.log('length = ' + element.files.length);
                var image_holder = $("#image-holder");
                image_holder.empty();
                if (element.files.length > 0) {
                    jQuery('#convalid').removeClass('hide');
                    jQuery('#coninprec').removeClass('hide');
                    //jQuery('#valid-till').attr('required', true);
                    image_holder.append('<button class="button button-small button-assertive remove icon ion-close" onclick="removeFile()"></button>');
                } else {
                    jQuery('#convalid').addClass('hide');
                    jQuery('#coninprec').addClass('hide');
                    //jQuery('#valid-till').attr('required', false);
                }
                if (typeof (FileReader) != "undefined") {
                    //loop for each file selected for uploaded.
                    for (var i = 0; i < element.files.length; i++) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
//                            $("<img />", {
//                                "src": e.target.result,
//                                "class": "thumb-image"
//                            }).appendTo(image_holder);
                            $('<span class="upattach"><i class="ion-paperclip"></i></span>').appendTo(image_holder);
                        }
                        image_holder.show();
                        reader.readAsDataURL(element.files[0]);
                    }
                }
            };

            $ionicModal.fromTemplateUrl('mealdetails', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.daymodal = function (day) {
                    console.log('Index = ' + day + ' day' + (day - 1));
                    $scope.day = 'day' + (day - 1);
                    $scope.modal.show();
                };

            });
            $scope.dietdetails = function (days) {
                console.log(days);
                $scope.dayMeal = [];
                for (var i = 1, j = 1; i <= days; i++, j++) {
                    $scope.mealDetails['day' + (i - 1)] = [{time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}];
                    $scope.dayMeal.push(i);
                    console.log(JSON.stringify($scope.mealDetails['day' + (i - 1)]));
                    console.log((i - 1));
                    //jQuery('#day' + (i - 1)).val(JSON.stringify($scope.mealDetails['day' + (i - 1)]));
                }
                console.log($scope.mealDetails);
                var stdt = $('#diet-start').val();
                var endDate = getDayAfter(stdt, days);
                console.log(endDate);
                $('#diet-end').val($filter('date')(endDate, 'yyyy-MM-dd'));
            };
            $scope.saveMeal = function (day) {
                console.log(day);
                //console.log('Is empty object ' + checkIsMealEmpty($scope.mealDetails[day]));
                if (checkIsMealEmpty($scope.mealDetails[day]) == 'not empty') {
                    console.log('Has value');
                    jQuery('#' + day).val(JSON.stringify($scope.mealDetails[day]));
                    jQuery('#fill' + day.charAt(day.length - 1)).removeClass('filled-data').addClass('filldata');
                } else {
                    console.log('Empty');
                }
                //console.log(JSON.stringify($scope.mealDetails[day]));
                $scope.modal.hide();
            };

            $scope.submitmodal = function () {
                $scope.modal.hide();
                $scope.mealDetails[($scope.day - 1)] = [{time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}, {time: '', details: ''}];
            };
        })

        .controller('RecordsViewCtrl', function ($scope, $http, $state, $stateParams, $rootScope, $cordovaPrinter, $ionicModal, $timeout) {
            $scope.interface = window.localStorage.getItem('interface_id');
            $scope.category = [];
            $scope.catId = $stateParams.id;
            $scope.patientId = $stateParams.patientId;
            $scope.shared = $stateParams.shared;
            $scope.limit = 3;
            $scope.recId = [];
            $scope.recIds = [];
            $scope.repeatFreq = [];
            $scope.repeatNo = [];
            $scope.userId = get('id');
            $scope.docId = get('id');
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-records-details',
                params: {id: $stateParams.id, userId: $scope.userId, shared: $scope.shared, patientId: $scope.patientId, interface: $scope.interface}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.records = response.data.records;
                if ($scope.records.length != 0) {
                    if ($scope.records[0].record_metadata.length == 6) {
                        $scope.limit = 3; //$scope.records[0].record_metadata.length;
                    }
                    angular.forEach($scope.records, function (value, key) {
                        console.log(key);
                        angular.forEach(value.record_metadata, function (val, k) {
                            console.log();
                            if ($scope.catId == 30) {
                                if (val.field_id == 'no-of-frequency') {
                                    $scope.repeatFreq[key] = val.value;
                                }
                                if (val.field_id == 'no-of-times') {
                                    $scope.repeatNo[key] = val.value;
                                }
                            }
                        });
                    });
                }
                $scope.category = response.data.category;
                $scope.createdby = response.data.createdby;
                $scope.doctors = response.data.doctors;
                $scope.problems = response.data.problems;
                $scope.cases = response.data.cases;
                $scope.patient = response.data.patient;
                $scope.doctrs = response.data.shareDoctrs;
            }, function errorCallback(response) {
                console.log(response);
            });
            $scope.getRecords = function (cat) {
                console.log(cat);
                $scope.catId = cat;
                //$stateParams.id = cat;
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/get-records-details',
                    params: {id: $stateParams.id, userId: $scope.userId, shared: $scope.shared, patientId: $scope.patientId, interface: $scope.interface}
                }).then(function successCallback(response) {
                    console.log(response.data);
                    $scope.records = response.data.records;
                    if ($scope.records.length != 0) {
                        if ($scope.records[0].record_metadata.length == 6) {
                            $scope.limit = 3; //$scope.records[0].record_metadata.length;
                        }
                    }
                    $scope.doctrs = response.data.shareDoctrs;
                    //$scope.category = response.data.category;
                    console.log($scope.catId);
                }, function errorCallback(response) {
                    console.log(response);
                });
                $rootScope.$digest;
            };
//            $scope.addRecord = function () {
//                $state.go('app.add-category', {'id': button.id}, {reload: true});
//            };
            //Delete Records by Category
            $scope.getRecIds = function (id) {
                console.log(id);
                if ($scope.recId[id]) {
                    $scope.recIds.push(id);
                } else {
                    var index = $scope.recIds.indexOf(id);
                    $scope.recIds.splice(index, 1);
                }
                console.log($scope.recIds);

            };
            $scope.getDocId = function (id) {
                console.log(id);
                $scope.docId = id;
            };
            //Delete all Records by category
            $scope.delete = function () {
                if ($scope.recIds.length > 0) {
                    var confirm = window.confirm("Do you really want to delete?");
                    if (confirm) {
                        console.log($scope.recIds);
                        $http({
                            method: 'POST',
                            url: domain + 'doctrsrecords/delete-by-category',
                            params: {ids: JSON.stringify($scope.recIds), userId: $scope.userId, shared: $scope.shared}
                        }).then(function successCallback(response) {
                            alert("Records deleted successfully!");
                            window.location.reload();
                        }, function errorCallback(e) {
                            console.log(e);
                        });
                    }
                } else {
                    alert("Please select records to delete!");
                }
            };
            //Share all records by Category
            $scope.share = function () {
                if ($scope.recIds.length > 0) {
                    if ($scope.docId != '') {
                        var confirm = window.confirm("Do you really want to share?");
                        if (confirm) {
                            console.log($scope.recIds);
                            $http({
                                method: 'POST',
                                url: domain + 'doctrsrecords/share-by-category',
                                params: {ids: JSON.stringify($scope.recIds), userId: $scope.userId, patientId: $scope.patientId, docId: $scope.docId, shared: $scope.shared}
                            }).then(function successCallback(response) {
                                console.log(response);
                                if (response.data == 'Success') {
                                    alert("Records shared successfully!");
                                    window.location.reload();
                                }
                            }, function errorCallback(e) {
                                console.log(e);
                            });

                        }
                    } else {
                        alert("Please select doctor to share with!");
                    }
                } else {
                    alert("Please select records to share!");
                }
            };
            // Delete and share buttons hide show
            $scope.recordDelete = function () {
                jQuery('.selectrecord').css('display', 'block');
                jQuery('.btview').css('display', 'none');
                jQuery('#rec1').css('display', 'none');
                jQuery('#rec3').css('display', 'block');

            };
            $scope.recordShare = function () {
                jQuery('.selectrecord').css('display', 'block');
                jQuery('.btview').css('display', 'none');
                jQuery('#rec1').css('display', 'none');
                jQuery('#rec2').css('display', 'block');

            }
            $scope.CancelAction = function () {
                jQuery('.selectrecord').css('display', 'none');
                jQuery('.btview').css('display', 'block');
                jQuery('#rec1').css('display', 'block');
                jQuery('#rec2').css('display', 'none');
                jQuery('#rec3').css('display', 'none');
            };

            $scope.selectcheckbox = function ($event) {
                console.log($event);
                // if($event==true){
                // jQuery(this).addClass('asd123');
                // }
            };
            //Show share model
            $ionicModal.fromTemplateUrl('share', {
                scope: $scope,
            }).then(function (modal) {
                $scope.modal = modal;
            });

            $scope.submitmodal = function () {
                console.log($scope.catIds);
                $scope.modal.hide();
            };
        })

        .controller('RecordDetailsCtrl', function ($scope, $http, $state, $stateParams, $timeout, $ionicModal, $rootScope, $sce) {
            $scope.recordId = $stateParams.id;
            $scope.catId = $stateParams.catId;
            $scope.userId = get('id');
            $scope.shared = $stateParams.shared;
            $scope.patientId = $stateParams.patientId;
            $scope.docId = get('id');
            $scope.measurements = {value: 'no'};
            $scope.obj = {value: 'no'};
            $scope.testResult = {value: 'no'};
            $scope.diagnosis = {value: 'no'};
            //$scope.interface = window.localStorage.getItem('interface_id');
            $scope.isNumber = function (num) {
                return angular.isNumber(num);
            }
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-record-details',
                params: {id: $stateParams.id, userId: $scope.userId, interface: $scope.interface}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.recordDetails = response.data.recordsDetails;
                $scope.category = response.data.record;
                $scope.problem = response.data.problem;
                $scope.cases = response.data.cases;
                $scope.patient = response.data.patient;
                $scope.doctors = response.data.doctrs;
                $scope.doctrs = response.data.shareDoctrs;
                $scope.otherRecords = response.data.otherRecords;
                if ($scope.otherRecords.length > 0) {
                    angular.forEach($scope.otherRecords, function (val, key) {
                        if (val.category == '12' || val.category == '13' || val.category == '16') {
                            $scope.measurements = {value: 'yes'};
                        } else if (val.category == '27') {
                            $scope.obj = {value: 'yes'};
                        } else if (val.category == '29') {
                            $scope.testResult = {value: 'yes'};
                        } else if (val.category == '28') {
                            $scope.diagnosis = {value: 'yes'};
                        }
                    });
                }
            }, function errorCallback(response) {
                console.log(response);
            });
            //DELETE Modal
            $scope.delete = function (id) {
                console.log($scope.category[0].category);
                $http({
                    method: 'POST',
                    url: domain + 'doctrsrecords/delete',
                    params: {id: id, shared: $scope.shared}
                }).then(function successCallback(response) {
                    alert("Record deleted successfully!");
                    $timeout(function () {
                        $state.go('app.records-view', {'id': $scope.category[0].category}, {}, {reload: true});
                        //$state.go('app.category-detail');
                    }, 1000);
                }, function errorCallback(e) {
                    console.log(e);
                });
            };
            $scope.getDocId = function (id) {
                console.log(id);
                $scope.docId = id;
            };
            //Share all records by Category
            $scope.share = function () {
                if ($scope.docId != '') {
                    var confirm = window.confirm("Do you really want to share?");
                    if (confirm) {
                        console.log($scope.recordId);
                        $http({
                            method: 'POST',
                            url: domain + 'doctrsrecords/share',
                            params: {id: $scope.recordId, userId: $scope.userId, patientId: $scope.patientId, docId: $scope.docId, shared: $scope.shared}
                        }).then(function successCallback(response) {
                            console.log(response);
                            if (response.data == 'Success') {
                                alert("Records shared successfully!");
                                window.location.reload();
                            }
                        }, function errorCallback(e) {
                            console.log(e);
                        });

                    }
                } else {
                    alert("Please select doctor to share with!");
                }
            };
            //EDIT Modal
//            $scope.edit = function (id, cat) {
//                $state.go('app.edit-record', {'id': id, 'cat': cat});
//                //window.location.href = "http://192.168.2.169:8100/#/app/edit-record/" + id + "/" + cat;
//            };
            // Load the modal from the given template URL
            $ionicModal.fromTemplateUrl('filesview.html', function ($ionicModal) {
                $scope.modal = $ionicModal;
                $scope.showm = function (path, name) {
                    console.log(path + '=afd =' + name);
                    $scope.value = $rootScope.attachpath + path + name;
                    $scope.modal.show();
                }

            }, {
                // Use our scope for the scope of the modal to keep it simple
                scope: $scope,
                // The animation we want to use for the modal entrance
                animation: 'slide-in-up'
            });
            $scope.trustSrc = function (src) {
                return $sce.trustAsResourceUrl(src);
            };
            $scope.submitmodal = function () {
                console.log($scope.catIds);
                $scope.modal.hide();
            };
            $scope.getMeasureDetails = function (id, type) {
                console.log(id + "===" + type);
                if (type == 'measurements') {
                    $state.go('app.view-measure-details', {id: id, type: type}, {reload: true});
                } else {
                    $state.go('app.view-cn-details', {id: id, type: type}, {reload: true});
                }
            };
            $scope.getCnDetails = function (id, type) {
                console.log(id + "===" + type);
                $state.go('app.view-cn-details', {id: id, type: type}, {reload: true});
            };
        })

        .controller('shareModalCtrl', function ($scope, $http, $state, $stateParams, $timeout, $ionicModal, $rootScope, $sce) {
            //Show share model
            $ionicModal.fromTemplateUrl('share', {
                scope: $scope,
            }).then(function (modal) {
                $scope.modal = modal;
            });

            $scope.submitmodal = function () {
                console.log($scope.catIds);
                $scope.modal.hide();
            };
        })

        .controller('SharedwithuCtrl', function ($scope, $http, $state, $stateParams, $timeout, $ionicModal, $rootScope, $sce) {
            $scope.patientId = $stateParams.id;
            $scope.shared = 1;
            $scope.userId = get('id');
            $scope.catIds = [];
            $scope.catId = [];
            $scope.docId = '';
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-patients-shared-record-category',
                params: {userId: $scope.userId, patientId: $stateParams.id, interface: $scope.interface, shared: $scope.shared}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.categories = response.data.categories;
                $scope.doctrs = response.data.doctrs;
                $scope.userRecords = response.data.recordCount;
                $scope.patient = response.data.patient;
            }, function errorCallback(e) {
                console.log(e);
            });
            $scope.getIds = function (id) {
                console.log(id);
                if ($scope.catId[id]) {
                    $scope.catIds.push(id);
                } else {
                    var index = $scope.catIds.indexOf(id);
                    $scope.catIds.splice(index, 1);
                }
                console.log($scope.catIds);
            };
            $scope.getDocId = function (id) {
                console.log(id);
                $scope.docId = id;
            };
            //Delete all Records by category
            $scope.delete = function () {
                if ($scope.catIds.length > 0) {
                    var confirm = window.confirm("Do you really want to delete?");
                    if (confirm) {
                        console.log($scope.catIds);
                        $http({
                            method: 'POST',
                            url: domain + 'doctrsrecords/delete-all',
                            params: {ids: JSON.stringify($scope.catIds), userId: $scope.userId, shared: $scope.shared}
                        }).then(function successCallback(response) {
                            alert("Records deleted successfully!");
                            $timeout(function () {
                                window.location.reload();
                                //$state.go('app.category-detail');
                            }, 1000);
                        }, function errorCallback(e) {
                            console.log(e);
                        });
                    }
                } else {
                    alert("Please select records to delete!");
                }
            };
            //Share all records by Category
            $scope.share = function () {
                if ($scope.catIds.length > 0) {
                    if ($scope.docId != '') {
                        var confirm = window.confirm("Do you really want to share?");
                        if (confirm) {
                            console.log($scope.catIds);
                            $http({
                                method: 'POST',
                                url: domain + 'doctrsrecords/share-all',
                                params: {ids: JSON.stringify($scope.catIds), userId: $scope.userId, patientId: $scope.patientId, docId: $scope.docId, shared: $scope.shared}
                            }).then(function successCallback(response) {
                                console.log(response);
                                if (response.data == 'Success') {
                                    alert("Records shared successfully!");
                                    $timeout(function () {
                                        window.location.reload();
                                    }, 1000);
                                }
                            }, function errorCallback(e) {
                                console.log(e);
                            });
                        }
                    } else {
                        alert("Please select doctor to share with!");
                    }
                } else {
                    alert("Please select records to share!");
                }
            };
            $ionicModal.fromTemplateUrl('share', {
                scope: $scope,
            }).then(function (modal) {
                $scope.modal = modal;
            });

            $scope.submitmodal = function () {
                console.log($scope.catIds);
                $scope.modal.hide();
            };
        })

        .controller('InventoryCtrl', function ($scope, $http, $stateParams, $ionicModal, $state) {
            $http({
                method: 'GET',
                url: domain + 'inventory/get-all-phc-location',
                params: {interface: $scope.interface}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.healthCenter = response.data.telecentre;
            }, function errorCallback(e) {
                console.log(e);
            });

            $scope.searchBy = function (type) {
                console.log(type);
                if (type == 1) {
                    jQuery("#textlocation").addClass('hide');
                    jQuery("#selectlocation").val("");
                    jQuery("#selectlocation").removeClass('hide');
                } else if (type == 0) {
                    jQuery("#textlocation").val("");
                    jQuery("#textlocation").removeClass('hide');
                    jQuery("#selectlocation").addClass('hide');
                }
            };

            $scope.searchByMedicine = function (searchkey) {
                $scope.searchkey = searchkey
                // alert($scope.searchkey);
                $state.go('app.searchinventory', {'key': $scope.searchkey}, {reload: true});
            };

            $scope.searchByLocation = function (locid) {
                $scope.searchkey = locid
                // alert($scope.searchkey);
                $state.go('app.search-location', {'key': $scope.searchkey}, {reload: true});
            };
        })

        .controller('InventorySearchCtrl', function ($scope, $http, $stateParams, $ionicModal, $state) {
            //$scope.getMedicine = [];
            $scope.searchkey = $stateParams.key;
            console.log("@@@@@@@" + $scope.searchkey);
            $http({
                method: 'GET',
                url: domain + 'inventory/search-medicine-doctor',
                params: {id: $scope.id, interface: $scope.interface, key: $scope.searchkey}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.getMedicine = response.data.getMedicine;
                $scope.otherMedicine = response.data.otherMedicine;

                $scope.telecentre = response.data.telecentre;
                $scope.getLocation = response.data.getLocation;

                var data = response.data.getLocation;
                $scope.location = _.reduce(
                        data,
                        function (output, name) {
                            var lCase = name.name.toUpperCase();
                            if (output[lCase[0]]) //if lCase is a key
                                output[lCase[0]].push(name); //Add name to its list
                            else
                                output[lCase[0]] = [name]; // Else add a key
                            console.log(output);
                            return output;
                        },
                        {}
                );
            }, function errorCallback(response) {
                console.log(response);
            });

// search from serach result ---Bhavana //
            $scope.searchByMedicine = function (searchkey) {
                $scope.searchkey = searchkey
                //  var data = new FormData(jQuery("#loginuser")[0]);
                $state.go('app.searchinventory', {'key': $scope.searchkey}, {reload: true});
            };

// search from serach result end ---Bhavana //

            $scope.searchByLocation = function (locId) {
                //alert(locId);
                $scope.searchkey = locId
                //  var data = new FormData(jQuery("#loginuser")[0]);
                $state.go('app.search-location', {'key': $scope.searchkey}, {reload: true});
            };

            $scope.changeLocation = function (locationid) {
                $scope.searchkey = locationid;
                $state.go('app.search-location', {'key': $scope.searchkey}, {reload: true});
            };
        })

        .controller('DoctrslistsCtrl', function ($scope, $http, $stateParams, $ionicModal, $ionicLoading) {
            $ionicModal.fromTemplateUrl('addp', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
            $scope.savePatient = function () {
                console.log('submit');
                $ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addPatientForm")[0]);
                callAjax("POST", domain + "doctorsapp/save-patient", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    $scope.modal.hide();
                    alert("Patient added successfully!");
                    window.location.reload();
                });
            };
        })

        .controller('ContentLibraryListCtrl', function ($scope, $http, $stateParams) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('ContentLibraryDetailsCtrl', function ($scope, $http, $stateParams) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('PatientAddCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
            $ionicModal.fromTemplateUrl('patient-add', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            })

            $scope.submitmodal = function () {
                $scope.modal.hide();
            }

        })

        .controller('PatientRecordCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('DoctorSettingsCtrl', function ($scope, $http, $ionicPlatform, $stateParams, $ionicModal, $ionicLoading, $state) {
            $scope.userId = window.localStorage.getItem('id');
            $scope.interface = window.localStorage.getItem('interface_id');
            $scope.video = 0;
            $scope.chat = 0;
            $scope.clinic = 0;
            $scope.home = 0;
            $http({
                method: 'GET',
                url: domain + 'doctors/get-doctor-setting',
                params: {docId: window.localStorage.getItem('id'), interface: $scope.interface}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.services = response.data.services;
                $scope.docServices = response.data.docServices;
                $scope.docSettings = response.data.docSettings;
                $scope.instant_permission = response.data.schedule;
                $scope.instant_status = response.data.status;
                $scope.status = $scope.instant_status.presence;
                $scope.notification = response.data.notification;
                angular.forEach($scope.docServices, function(value, key){
                    if(value.service.id=='1' && value.active=='1'){
                        $scope.video = 1;
                    }else if(value.service.id=='2' && value.active=='1'){
                        $scope.chat = 1;
                    }else if(value.service.id=='3' && value.active=='1'){
                        $scope.clinic = 1;
                    }else if(value.service.id=='4' && value.active=='1'){
                        $scope.home = 1;
                    }
                });
                if ($scope.instant_permission.instant_permission) {
                    jQuery('#setting').removeClass('hide');
                } else {
                    jQuery('#setting').addClass('hide');
                }
                $scope.instant_days = [{text: "Monday", value: '1'},
                    {text: "Tuesday", value: '2'},
                    {text: "Wednesday", value: '3'},
                    {text: "Thursday", value: '4'},
                    {text: "Friday", value: '5'},
                    {text: "Saturday", value: '6'},
                    {text: "Sunday", value: '7'}];
                $scope.instant_days_end = [{text: "Monday", value: '1'},
                    {text: "Tuesday", value: '2'},
                    {text: "Wednesday", value: '3'},
                    {text: "Thursday", value: '4'},
                    {text: "Friday", value: '5'},
                    {text: "Saturday", value: '6'},
                    {text: "Sunday", value: '7'}];
                $scope.instant_time = [{text: "09:00", value: '09:00:00'},
                    {text: "10:00", value: '10:00:00'},
                    {text: "11:00", value: '11:00:00'},
                    {text: "12:00", value: '12:00:00'},
                    {text: "13:00", value: '13:00:00'},
                    {text: "14:00", value: '14:00:00'},
                    {text: "15:00", value: '15:00:00'},
                    {text: "16:00", value: '16:00:00'},
                    {text: "17:00", value: '17:00:00'},
                    {text: "18:00", value: '18:00:00'},
                    {text: "19:00", value: '19:00:00'},
                    {text: "20:00", value: '20:00:00'},
                    {text: "21:00", value: '21:00:00'},
                    {text: "22:00", value: '22:00:00'},
                    {text: "23:00", value: '23:00:00'}];
                $scope.instant_time_end = [{text: "09:00", value: '09:00:00'},
                    {text: "10:00", value: '10:00:00'},
                    {text: "11:00", value: '11:00:00'},
                    {text: "12:00", value: '12:00:00'},
                    {text: "13:00", value: '13:00:00'},
                    {text: "14:00", value: '14:00:00'},
                    {text: "15:00", value: '15:00:00'},
                    {text: "16:00", value: '16:00:00'},
                    {text: "17:00", value: '17:00:00'},
                    {text: "18:00", value: '18:00:00'},
                    {text: "19:00", value: '19:00:00'},
                    {text: "20:00", value: '20:00:00'},
                    {text: "21:00", value: '21:00:00'},
                    {text: "22:00", value: '22:00:00'},
                    {text: "23:00", value: '23:00:00'}];
                // $scope.settingsList = [ { text: "Wireless", checked: true }];

            }, function errorCallback(e) {
                console.log(e);
            });

            $scope.pushNotification = function (notification) {
                console.log("val " + notification);
                if (notification == true) {
//               alert('register user');
                    $ionicPlatform.on("deviceready", function () {


                        window.plugins.OneSignal.getIds(function (ids) {

                            console.log('getIds: ' + JSON.stringify(ids));
                            //  alert('UserID: ' + JSON.stringify(ids.userId));
                            $http({
                                method: 'GET',
                                url: domain + 'notification/insertPlayerId',
                                params: {userId: window.localStorage.getItem('id'), playerId: ids.userId}
                            }).then(function successCallback(response) {
                                if (response.data == 1) {
                                    alert('Notification setting updated');
                                }
                            }, function errorCallback(e) {
                                console.log(e);
                            });

                        });
                    });
                } else {
                    $ionicPlatform.on("deviceready", function () {
                        // window.plugins.OneSignal.enableInAppAlertNotification(true);
                        $http({
                            method: 'GET',
                            url: domain + 'notification/changeStatus',
                            params: {userId: window.localStorage.getItem('id')}
                        }).then(function successCallback(response) {
                            if (response.data == 1) {
                                alert('Notification setting updated');
                            }
                        }, function errorCallback(e) {
                            console.log(e);
                        });
                    });
                }
            }

            $scope.checkp = function (val) {
                if (val) {
                    jQuery('#setting').removeClass('hide');
                } else {
                    jQuery('#setting').addClass('hide');
                }
            }
            $scope.submitInstantPermission = function () {
                var data = new FormData(jQuery("#instantpermission")[0]);
                $.ajax({
                    type: 'POST',
                    url: domain + "doctors/update-doctor-permission",
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function (response) {
                        $ionicLoading.hide();
                        console.log(response);
                        if (response == '0') {
                            alert('End time cannot be earlier than start time');
                        }
                        if (response == '2') {
                            alert('End day cannot be earlier than start day');
                        }
                        $state.go('app.doctor-settings', {}, {reload: true});
                    },
                    error: function (e) {
                        //  console.log(e.responseText);
                    }
                });
            }

            $scope.doctor_presence = function (value) {
                var id = window.localStorage.getItem('id');
                var data = {status: value, did: id};
                $.ajax({
                    type: 'POST',
                    url: domain + "doctors/update-doctor-presense",
                    data: data,
                    cache: false,
                    success: function (response) {
                        alert('Your status has been changed');
                        $state.go('app.doctor-settings');
                    }
                });
            };
        })

        .controller('PatientListCtrl', function ($scope, $http, $stateParams, $ionicModal, $ionicLoading) {
            $scope.userId = window.localStorage.getItem('id');
            $scope.users = {};
            $scope.curTime = new Date();
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-all-patients',
                params: {userId: $scope.userId}
            }).then(function successCallback(response) {
                console.log(response.data.length);
                if (response.data.length > 0) {
                    var data = response.data;
                    $scope.users = _.reduce(
                            data,
                            function (output, fname) {
                                var lCase = fname.fname.toUpperCase();
                                if (output[lCase[0]]) //if lCase is a key
                                    output[lCase[0]].push(fname); //Add name to its list
                                else
                                    output[lCase[0]] = [fname]; // Else add a key
                                console.log(output);
                                return output;
                            },
                            {}
                    );
                }
            }, function errorCallback(e) {
                console.log(e);
            });
            $ionicModal.fromTemplateUrl('addp', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
            $scope.savePatient = function () {
                console.log('submit');
                $ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addPatientForm")[0]);
                callAjax("POST", domain + "doctorsapp/save-patient", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    $scope.modal.hide();
                    alert("Patient added successfully!");
                    window.location.reload();
                });

            };
        })

        .controller('PatientCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $scope.patientId = $stateParams.id;
            $scope.userId = get('id');
            console.log($scope.patientId);
            window.localStorage.setItem('patientId', $scope.patientId)
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-patient-details',
                params: {userId: $scope.userId, patientId: $scope.patientId}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.dob = response.data.dob;
                $scope.chatPastcnt = response.data.chatPastcnt;
                $scope.chatActivecnt = response.data.chatActivecnt;
                $scope.recordsCreatedCnt = response.data.recordsCreatedCnt;
                $scope.recordsSharedCnt = response.data.recordsSharedCnt;
                $scope.activeAppCnt = response.data.activeAppCnt;
                $scope.pastAppCnt = response.data.pastAppCnt;
                $scope.patientDetails = response.data.patientDetails;
            }, function errorCallback(e) {
                console.log(e);
            });
        })

        .controller('ConsultationProfileCtrl', function ($scope, $http, $state, $stateParams, $rootScope, $filter, $ionicLoading, $ionicModal, $timeout, $ionicTabsDelegate) {
            $scope.apply = '0';
            $scope.discountApplied = '0';
            $scope.vSch = [];
            $scope.schV = [];
            $scope.schdate = [];
            $scope.nextdate = [];
            $scope.cSch = [];
            $scope.schC = [];
            $scope.schCdate = [];
            $scope.nextCdate = [];
            $scope.hSch = [];
            $scope.schH = [];
            $scope.schHdate = [];
            $scope.nextHdate = [];
            $scope.bookingSlot = '';
            $scope.supId = '';
            $scope.patientId = $stateParams.id;
            $scope.userId = window.localStorage.getItem('id');
            window.localStorage.setItem('patientId', $stateParams.id);
            //$scope.interface = window.localStorage.getItem('interface_id');
            $ionicLoading.show({template: 'Loading...'});
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-prod-details',
                params: {id: $scope.userId, interface: $scope.interface}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.doctor = response.data.user;
                $scope.videoProd = response.data.video_product;
                $scope.instVideo = response.data.inst_video;
                $scope.videoInc = response.data.video_inclusions;
                $scope.videoSch = response.data.videoSch;
                $scope.videoFollow = response.data.videoFollowServices;
                $scope.chatProd = response.data.chat_product;
                $scope.chatInc = response.data.chat_inclusions;
                $scope.chatFollow = response.data.chatFollowServices;
                $scope.homeProd = response.data.home_product;
                $scope.homeInc = response.data.home_inclusions;
                $scope.homeSch = response.data.homeSch;
                $scope.homeFollow = response.data.homeFollowServices;
                $scope.clinicProd = response.data.clinic_product;
                $scope.clinicInc = response.data.clinic_inclusions;
                $scope.clinicSch = response.data.clinicSch;
                $scope.clinicFollow = response.data.clinicFollowServices;
                $scope.packages = response.data.packages;
                $scope.services = response.data.services;
                $scope.service = response.data.service;
                //console.log("prodId " + $scope.instVideo + "popopo");
                //$ionicLoading.hide();
                angular.forEach($scope.videoSch, function (value, key) {
                    var supsassId = value.supersaas_id;
                    //var from = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                    //console.log(supsassId);
                    $http({
                        method: 'GET',
                        url: domain + 'doctors/get-doctors-availability',
                        params: {id: supsassId, from: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')}
                    }).then(function successCallback(responseData) {
                        $scope.vSch[key] = responseData.data.slots;
                        $scope.schV[key] = supsassId;
                        if (responseData.data.lastdate == '')
                        {
                            $scope.schdate[key] = new Date();
                            var tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextdate[key] = tomorrow;
                        } else {
                            $scope.schdate[key] = new Date(responseData.data.lastdate);
                            var tomorrow = new Date(responseData.data.lastdate);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextdate[key] = $filter('date')(new Date(tomorrow), 'yyyy-MM-dd');
                        }
                        $rootScope.$digest;
                    }, function errorCallback(response) {
                        console.log(response.responseText);
                    });
                });
                angular.forEach($scope.clinicSch, function (value, key) {
                    var supsassId = value.supersaas_id
                    $http({
                        method: 'GET',
                        url: domain + 'doctors/get-doctors-availability',
                        params: {id: supsassId, from: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')}
                    }).then(function successCallback(responseData) {
                        $scope.cSch[key] = responseData.data.slots;
                        $scope.schC[key] = supsassId;
                        if (responseData.data.lastdate == '')
                        {
                            $scope.schCdate[key] = new Date();
                            var tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextCdate[key] = tomorrow;
                        } else {
                            $scope.schCdate[key] = new Date(responseData.data.lastdate);
                            var tomorrow = new Date(responseData.data.lastdate);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextCdate[key] = $filter('date')(new Date(tomorrow), 'yyyy-MM-dd');
                        }
                        $rootScope.$digest;
                    }, function errorCallback(response) {
                        console.log(response);
                    });
                });
                angular.forEach($scope.homeSch, function (value, key) {
                    var supsassId = value.supersaas_id
                    $http({
                        method: 'GET',
                        url: domain + 'doctors/get-doctors-availability',
                        params: {id: supsassId, from: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')}
                    }).then(function successCallback(responseData) {
                        $scope.hSch[key] = responseData.data.slots;
                        $scope.schH[key] = supsassId;
                        if (responseData.data.lastdate == '') {
                            $scope.schHdate[key] = new Date();
                            var tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextHdate[key] = tomorrow;
                        } else {
                            $scope.schHdate[key] = new Date(responseData.data.lastdate);
                            var tomorrow = new Date(responseData.data.lastdate);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextHdate[key] = $filter('date')(new Date(tomorrow), 'yyyy-MM-dd');
                        }
                        $rootScope.$digest;
                    }, function errorCallback(response) {
                        console.log(response);
                    });
                });
                $ionicLoading.hide();
            });

            $scope.checkAvailability = function (uid, prodId) {
                $scope.interface = window.localStorage.getItem('interface_id');
                console.log("prodId check availability" + prodId);
                console.log("uid " + uid);
                var from = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                $scope.startSlot = $filter('date')(getAfterTime(from, 10), 'yyyy-MM-dd HH:mm:ss');
                $scope.bookingStart = $scope.startSlot;
                $scope.endSlot = $filter('date')(getAfterTime($scope.startSlot, 30), 'yyyy-MM-dd HH:mm:ss');
                $scope.bookingEnd = $scope.endSlot;
                $scope.bookAppointment(prodId, 1);
//                $rootScope.$broadcast('loading:hide');
//                $ionicLoading.show();
//                $http({
//                    method: 'GET',
//                    url: domain + 'kookoo/check-doctor-availability',
//                    params: {id: uid, interface: $scope.interface}
//                }).then(function successCallback(responseData) {
//                    if (responseData.data.status == 1) {
//                        $state.go('app.checkavailable', {'data': prodId, 'uid': uid});
//                    } else {
//                        alert('Sorry. The specialist is currently unavailable. Please try booking a scheduled video or try again later.');
//                    }
//                });
            };
            $scope.getNextSlots = function (nextDate, supsassId, key, serv) {
                console.log(nextDate + '=======' + supsassId + '=====' + key + "Seveice == " + serv);
                var from = $filter('date')(new Date(nextDate), 'yyyy-MM-dd') + '+05:30:00';  // HH:mm:ss
                $ionicLoading.show({template: 'Loading...'});
                $http({
                    method: 'GET',
                    url: domain + 'doctors/get-doctors-availability',
                    cache: false,
                    params: {id: supsassId, from: from}
                }).then(function successCallback(responseData) {
                    //$ionicLoading.hide();
                    if (responseData.data.lastdate == '') {
                        if (serv == 1) {
                            $scope.vSch[key] = responseData.data.slots;
                            $scope.schdate[key] = new Date();
                            $scope.nextdate[key] = $filter('date')(new Date(), 'yyyy-MM-dd');
                            $rootScope.$digest;
                        } else if (serv == 3) {
                            console.log('Serv = if');
                            $scope.cSch[key] = responseData.data.slots;
                            $scope.schCdate[key] = new Date();
                            $scope.nextCdate[key] = $filter('date')(new Date(), 'yyyy-MM-dd');
                            $rootScope.$digest;
                        } else if (serv == 4) {
                            $scope.hSch[key] = responseData.data.slots;
                            $scope.schHdate[key] = new Date();
                            $scope.nextHdate[key] = $filter('date')(new Date(), 'yyyy-MM-dd');
                            $rootScope.$digest;
                        }
                    } else {
                        if (serv == 1) {
                            $scope.vSch[key] = responseData.data.slots;
                            $scope.schdate[key] = new Date(responseData.data.lastdate);
                            var tomorrow = new Date(responseData.data.lastdate);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextdate[key] = $filter('date')(new Date(tomorrow), 'yyyy-MM-dd');
                            $rootScope.$digest;
                        } else if (serv == 3) {
                            console.log('Serv = else');
                            $scope.cSch[key] = responseData.data.slots;
                            $scope.schCdate[key] = new Date(responseData.data.lastdate);
                            var tomorrow = new Date(responseData.data.lastdate);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextCdate[key] = $filter('date')(new Date(tomorrow), 'yyyy-MM-dd');
                            $rootScope.$digest;
                        } else if (serv == 4) {
                            $scope.hSch[key] = responseData.data.slots;
                            $scope.schHdate[key] = new Date(responseData.data.lastdate);
                            var tomorrow = new Date(responseData.data.lastdate);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextHdate[key] = $filter('date')(new Date(tomorrow), 'yyyy-MM-dd');
                            $rootScope.$digest;
                        }
                    }
                    $ionicLoading.hide();
                }, function errorCallback(response) {
                    console.log(response);
                });
            };
            $scope.getFirstSlots = function (supsassId, key, serv) {
                //var from = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                $ionicLoading.show({template: 'Loading...'});
                $http({
                    method: 'GET',
                    url: domain + 'doctors/get-doctors-availability',
                    params: {id: supsassId, from: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')}
                }).then(function successCallback(responseData) {
                    //$ionicLoading.hide();
                    if (serv == 1) {
                        if (responseData.data.slots == '') {
                            $scope.vSch[key] = responseData.data.slots;
                            $scope.schdate[key] = new Date();
                            var tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextdate[key] = $filter('date')(new Date(tomorrow), 'yyyy-MM-dd');
                        } else {
                            $scope.vSch[key] = responseData.data.slots;
                            $scope.schdate[key] = new Date(responseData.data.lastdate);
                            var tomorrow = new Date(responseData.data.lastdate);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextdate[key] = $filter('date')(new Date(tomorrow), 'yyyy-MM-dd');
                        }
                    } else if (serv == 3) {
                        if (responseData.data.slots == '') {
                            $scope.cSch[key] = responseData.data.slots;
                            $scope.schCdate[key] = new Date();
                            var tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextCdate[key] = $filter('date')(new Date(tomorrow), 'yyyy-MM-dd');
                        } else {
                            $scope.cSch[key] = responseData.data.slots;
                            $scope.schCdate[key] = new Date(responseData.data.lastdate);
                            var tomorrow = new Date(responseData.data.lastdate);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextCdate[key] = $filter('date')(new Date(tomorrow), 'yyyy-MM-dd');
                        }
                    } else if (serv == 4) {
                        if (responseData.data.slots == '') {
                            $scope.hSch[key] = responseData.data.slots;
                            $scope.schHdate[key] = new Date();
                            var tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextHdate[key] = $filter('date')(new Date(tomorrow), 'yyyy-MM-dd');
                        } else {
                            $scope.hSch[key] = responseData.data.slots;
                            $scope.schHdate[key] = new Date(responseData.data.lastdate);
                            var tomorrow = new Date(responseData.data.lastdate);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            $scope.nextHdate[key] = $filter('date')(new Date(tomorrow), 'yyyy-MM-dd');
                        }
                    }
                    $ionicLoading.hide();
                }, function errorCallback(response) {
                    console.log(response);
                });
            };
            $scope.bookSlot = function (starttime, endtime, supid, servId) {
                $scope.bookingStart = starttime;
                $scope.bookingEnd = endtime;
                $scope.supId = supid;
                $scope.servId = servId;
            };
            $scope.bookAppointment = function (prodId, serv) {
                // $scope.pleaseselectslot = response.data.pleaseselectslot;
                console.log($scope.bookingStart);
                if ($scope.bookingStart) {
                    window.localStorage.setItem('servId', $scope.servId);
                    window.localStorage.setItem('supid', $scope.supId);
                    window.localStorage.setItem('startSlot', $scope.bookingStart);
                    window.localStorage.setItem('endSlot', $scope.bookingEnd);
                    window.localStorage.setItem('prodId', prodId);
                    window.localStorage.setItem('mode', serv);
                    $rootScope.supid = $scope.supId;
                    $rootScope.startSlot = $scope.bookingStart;
                    $rootScope.endSlot = $scope.bookingEnd;
                    $rootScope.prodid = prodId;
                    $rootScope.url = 'app.payment';
                    $rootScope.$digest;
                    console.log($scope.patientId + "===" + $scope.userId);
                    if (serv == 1) {
                        if (checkLogin())
                        {
                            $ionicLoading.show({template: 'Loading...'});
                            $state.go('app.payment');
                        } else {
                            $ionicLoading.show({template: 'Loading...'});
                            $state.go('auth.login');
                        }
                    } else if (serv == 3 || serv == 4) {
                        if (checkLogin())
                        {
                            $ionicLoading.show({template: 'Loading...'});
                            $state.go('app.payment');
                        } else {
                            $ionicLoading.show({template: 'Loading...'});
                            $state.go('auth.login');
                        }
                    }
                } else {
                    alert("Please select slot first");
                }
            };
            $scope.bookChatAppointment = function (prodId, serv) {
                window.localStorage.setItem('prodId', prodId);
                //window.localStorage.setItem('url', 'app.payment');
                window.localStorage.setItem('mode', serv);
                $rootScope.prodid = prodId;
                $rootScope.url = 'app.payment';
                if (checkLogin()) {
                    $ionicLoading.show({template: 'Loading...'});
                    $state.go('app.payment');
                } else
                {
                    $ionicLoading.show({template: 'Loading...'});
                    $state.go('auth.login');
                }
            };
            /* view more doctor profile modalbox*/
            $ionicModal.fromTemplateUrl('viewmoreprofile.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
            /* end profile */
            $ionicLoading.show({template: 'Loading...'});
            $timeout(function () {
                $ionicLoading.hide();
                $ionicTabsDelegate.select(0);
            }, 10);
        })

        .controller('AppPreviewCtrl', function ($scope, $http, $state, $filter, $location, $stateParams, $rootScope, $ionicLoading, $ionicGesture, $timeout, $ionicHistory) {
            $scope.counter1 = 300;
            var stopped1;
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.drId = window.localStorage.getItem('id');
            $scope.userId = get('id');
            $scope.prodid = window.localStorage.getItem('prodId');
            console.log($scope.patientId + "--" + $scope.drId);
            $scope.$on('$destroy', function () {
                $timeout.cancel(stopped1);
            });
            $scope.paynowcountdown = function () {
                stopped1 = $timeout(function () {
                    console.log($scope.counter1);
                    $scope.counter1--;
                    $scope.paynowcountdown();
                }, 1000);
                if ($scope.counter1 == 0) {
                    //console.log('fadsf af daf');
                    $timeout.cancel(stopped1);
                    $state.go('app.doctr-services', {'id': $scope.drId}, {reload: true});
                }
            };
            $timeout(function () {
                $scope.paynowcountdown();
            }, 0);
            $scope.mode = window.localStorage.getItem('mode');
            $scope.servId = window.localStorage.getItem('servId');
            $scope.supid = window.localStorage.getItem('supid');
            $scope.startSlot = window.localStorage.getItem('startSlot');
            $scope.endSlot = window.localStorage.getItem('endSlot');
            $scope.prodid = window.localStorage.getItem('prodId');
            $scope.interface = window.localStorage.getItem('interface_id');
            $scope.curTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $http({
                method: 'GET',
                url: domain + 'doctorsweb/get-order-details',
                params: {id: $scope.supid, prodId: $scope.prodid, interface: $scope.interface, patientId: $scope.patientId}
            }).then(function successCallback(responseData) {
                console.log(responseData.data);
                $ionicLoading.show({template: 'Loading...'});
                //$ionicLoading.hide();
                $scope.patient = responseData.data.patient;
                $scope.payment = responseData.data.payment;
                $scope.confirm = responseData.data.confirm;
                $scope.confirm_appointment = responseData.data.confirm_appointment;
                $scope.language = responseData.data.lang.language;
                $scope.product = responseData.data.prod;
                $scope.prod_inclusion = responseData.data.prod_inclusion;
                $scope.doctor = responseData.data.doctor;
                $scope.IVstartSlot = responseData.data.IVstart;
                $scope.IVendSlot = responseData.data.IVend;
                if (window.localStorage.getItem('instantV') == 'instantV') {
                    window.localStorage.setItem('IVstartSlot', $scope.IVstartSlot);
                    window.localStorage.setItem('IVendSlot', $scope.IVendSlot);
                }
                $ionicLoading.hide();
            }, function errorCallback(response) {
                console.log(response);
            });
            $scope.bookNow = function () {
                $timeout.cancel(stopped1);
                $ionicLoading.show({template: 'Loading...'});
                if (window.localStorage.getItem('instantV') == 'instantV') {
                    $scope.startSlot = window.localStorage.getItem('IVstartSlot');
                    $scope.endSlot = window.localStorage.getItem('IVendSlot');
                } else {
                    $scope.startSlot = window.localStorage.getItem('startSlot');
                    $scope.endSlot = window.localStorage.getItem('endSlot');
                }
                $scope.kookooID = window.localStorage.getItem('kookooid');
                $scope.kookooID = window.localStorage.getItem('kookooid1');
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $http({
                    method: 'GET',
                    url: domain + 'doctorsweb/book-appointment',
                    params: {prodId: $scope.prodid, kookooID: $scope.kookooID, userId: $scope.userId, servId: $scope.servId, startSlot: $scope.startSlot, endSlot: $scope.endSlot, patientId: $scope.patientId}
                }).then(function successCallback(response) {
                    //console.log(response.data);
                    $ionicLoading.hide();
                    $timeout.cancel(stopped1);
                    if (response.data == 'success')
                    {
                        $state.go('app.thankyou', {'data': response.data}, {reload: true});
                    } else {

                        alert('Appointment is not booked due to some issues!');
                        $state.go('app.patient', {'id': $scope.patientId, 'drId': $scope.drId}, {reload: true});
                    }
                }, function errorCallback(response) {
                    console.log(response);
                });
            };
        })

        .controller('ThankyouCtrl', function ($scope, $http, $state, $location, $stateParams, $rootScope, $ionicGesture, $timeout, $sce, $ionicHistory) {
            console.log($stateParams.data);
            $scope.id = window.localStorage.getItem('id');
            $scope.data = $stateParams.data;
            if (window.localStorage.getItem('instantV') != null) {
                window.localStorage.removeItem('kookooid');
                window.localStorage.removeItem('IVendSlot');
                window.localStorage.removeItem('IVstartSlot');
            }
            window.localStorage.removeItem('instantV');
            window.localStorage.removeItem('startSlot');
            window.localStorage.removeItem('endSlot');
            window.localStorage.removeItem('kookooid');
            window.localStorage.removeItem('kookooid1');
            window.localStorage.removeItem('prodId');
            window.localStorage.removeItem('patientId');
            window.localStorage.removeItem('drId');
            window.localStorage.removeItem('supid');
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $scope.gotohome = function () {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                if (window.localStorage.getItem('instantV') != null) {
                    window.localStorage.removeItem('kookooid');
                    window.localStorage.removeItem('IVendSlot');
                    window.localStorage.removeItem('IVstartSlot');
                }
                window.localStorage.removeItem('instantV');
                window.localStorage.removeItem('startSlot');
                window.localStorage.removeItem('endSlot');
                window.localStorage.removeItem('kookooid');
                window.localStorage.removeItem('kookooid1');
                window.localStorage.removeItem('prodId');
                window.localStorage.removeItem('patientId');
                window.localStorage.removeItem('drId');
                window.localStorage.removeItem('supid');
                $ionicHistory.clearCache();
                $ionicHistory.clearHistory();
                $state.go('app.doctor-consultations', {}, {reload: true});
            };
        })

        .controller('PatientAppointmentListCtrl', function ($scope, $http, $stateParams, $ionicModal, $filter, $state) {
            $scope.userId = window.localStorage.getItem('id');
            $scope.curTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $scope.patientId = $stateParams.id;
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-patientall-app',
                params: {patientId: $scope.patientId, userId: $scope.userId}
            }).then(function successCallback(response) {
                console.log(response.data);
                //end past section
                $scope.all_app = response.data.all_appointments;
                $scope.all_usersData = response.data.all_usersData;
                $scope.all_doctor = response.data.all_doctor;
                $scope.all_products = response.data.all_products;
                $scope.all_time = response.data.all_time;
                $scope.all_end_time = response.data.all_end_time;
                $scope.all_note = response.data.all_note;
                //past section //
                $scope.all_app_past = response.data.all_appointments_past;
                $scope.all_doctor_past = response.data.all_doctor_past;
                $scope.all_usersData_past = response.data.all_usersData_past;
                $scope.all_products_past = response.data.all_products_past;
                $scope.all_time_past = response.data.all_time_past;
                $scope.all_end_time_past = response.data.all_end_time_past;
                $scope.all_note_past = response.data.all_note_past;
                //end past section//
            }, function errorCallback(e) {
                console.log(e);
            });

            $scope.searchFilter = function (obj) {
                var re = new RegExp($scope.searchText, 'i');
                return !$scope.searchText || re.test(obj.name) || re.test(obj.age.toString());
            };
            $scope.cancelAppointment = function (appId, drId, mode, startTime) {
                $scope.appId = appId;
                $scope.userId = get('id');
                $scope.drId = drId;
                $scope.cancel = '';
                console.log(drId);
                console.log(startTime);
                var curtime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                console.log(curtime);
                var timeDiff = getTimeDiff(startTime, curtime);
                console.log(timeDiff);
                if (timeDiff < 15) {
                    if (mode == 1) {
                        alert("Appointment can not be cancelled now!");
                    } else {
                        //ask 4 options
                        /*$http({
                         method: 'GET',
                         url: domain + 'appointment/cancel-app',
                         params: {appId: $scope.appId, prodId: $scope.prodid, userId: $scope.userId, drId: $scope.drId}
                         }).then(function successCallback(response) {
                         console.log(response.data);
                         if (response.data == 'success') {
                         alert('Your appointment is cancelled successfully.');
                         } else {
                         alert('Sorry your appointment is not cancelled.');
                         }
                         $state.go('app.consultations-list');
                         }, function errorCallback(response) {
                         console.log(response);
                         });*/
                    }
                } else {
                    if (mode == 1) {
                        $http({
                            method: 'GET',
                            url: domain + 'appointment/cancel-app',
                            params: {appId: $scope.appId, prodId: $scope.prodid, userId: $scope.userId, drId: $scope.drId}
                        }).then(function successCallback(response) {
                            console.log(response.data);
                            if (response.data == 'success') {
                                alert('Your appointment is cancelled successfully.');
                                $state.go('app.doctor-consultations', {}, {reload: true});
                            } else {
                                alert('Sorry your appointment is not cancelled.');
                            }
                            //$state.go('app.consultations-list', {}, {reload: true});
                        }, function errorCallback(response) {
                            console.log(response);
                        });
                    } else if (mode == 3 || mode == 4) {
                        //ask for 2 options
                    }
                }
            };
            $scope.joinVideo = function (mode, start, end, appId, patientId) {
                console.log(mode + "===" + start + '===' + end + "===" + $scope.curTime + "==" + appId + "===Dr " + patientId);
                if ($scope.curTime >= start || $scope.curTime <= end) {
                    console.log('redirect');
                    window.localStorage.setItem("patientId", patientId);
                    //$state.go('app.patient-join', {}, {reload: true});
                    $state.go('app.patient-join', {'id': appId, 'mode': mode}, {reload: true});
                } else {
                    alert("You can join video before 15 minutes.");
                }
            };
            //Go to consultation add page
            $scope.addCnote = function (appId) {
                //alert(appId);
                store({'appId': appId});
                $state.go("app.cnote", {'appId': appId}, {reload: true});
            };
            //Go to consultation view page
            $scope.viewNote = function (noteId) {
                //alert(appId);
                store({'noteId': noteId});
                $state.go("app.view-note", {'id': noteId}, {reload: true});
            };
        })

        .controller('HomepageCtrl', function ($scope, $http, $stateParams, $ionicModal, $rootScope, $ionicLoading) {
            $rootScope.recCId = "";
            $rootScope.measurement = "";
            //$rootScope.famHist = ""
            $rootScope.objText = "";
            $rootScope.diaText = "";
            $rootScope.testText = "";
            $rootScope.objId = "";
            $rootScope.diaId = "";
            $rootScope.testId = "";
            $rootScope.inv = [];
            $rootScope.medi = [];
            $rootScope.proc = [];
            $rootScope.life = [];
            $rootScope.refer = [];
            $scope.doctorId = get('id');
            $scope.unreadCnt = 0;
            window.localStorage.setItem('interface_id', '8');
            window.localStorage.removeItem('patientId');
            window.localStorage.removeItem('noteId');
            window.localStorage.removeItem('appId');
            window.localStorage.removeItem('drId');
            window.localStorage.removeItem('doctorId');
            $ionicLoading.show({template: 'Loading..'});
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-chat-unread-cnt',
                params: {userId: $scope.doctorId}
            }).then(function sucessCallback(response) {
                console.log(response);
                $scope.unreadCnt = response.data;
            }, function errorCallback(e) {
                console.log(e);
            });
            $http({
                method: 'GET',
                url: domain + 'get-dr-homemenu',
                params: {id: $scope.userId, interface: $scope.interface}
            }).then(function successCallback(response) {
                if (response.data) {
                    $scope.menuItem = response.data.menuItem;
                    $ionicLoading.hide();
                } else {
                }
            }, function errorCallback(response) {
                // console.log(response);
            });


        })

        .controller('PatientRecordCtrl', function ($scope, $http, $stateParams, $ionicModal, $state) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('PatientConsultCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('ViewContentCtrl', function ($scope, $http, $stateParams, $ionicModal, $filter, $sce) {
            $scope.contentId = $stateParams.id;
            $http({
                method: 'GET',
                url: domain + 'contentlibrary/get-content-value',
                params: {conId: $scope.contentId}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                $scope.cval = response.data;
            }, function errorCallback(e) {
                console.log(e);
            });
            $scope.trustSrc = function (src) {
                return $sce.trustAsResourceUrl($filter('split')(src, '?', 0));
            };


        })

        .controller('ContentLibraryCtrl', function ($scope, $http, $stateParams, $ionicModal, $filter, $sce) {
            $scope.category_sources = [];
            $scope.Math = window.Math;
            $scope.categoryId = $stateParams.categoryId;

            $ionicModal.fromTemplateUrl('create-library', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };

            $http({
                method: 'GET',
                url: domain + 'contentlibrary/get-doctors-article',
                params: {doctorId: window.localStorage.getItem('id')}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                $scope.clab = response.data;
                // $scope.cntentvalCount = Math.random(response.data.content_value.length);
            }, function errorCallback(e) {
                console.log(e);
            });
            $scope.trustSrc = function (src) {
                return $sce.trustAsResourceUrl($filter('split')(src, '?', 0));
            };



        })

        .controller('NewarticleCtrl', function ($scope, $http, $state, $stateParams, $ionicScrollDelegate, $ionicModal, $ionicLoading) {
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.category_sources = [];
            $scope.checkboxval = false;
            $scope.categoryId = $stateParams.categoryId;
            $http({
                method: 'GET',
                url: domain + 'contentlibrary/get-text-article-details',
                params: {doctorId: window.localStorage.getItem('id')}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                $scope.category = response.data.category;
                $scope.target_groups = response.data.target_groups;
                $scope.languages = response.data.languages;
                $scope.catId = response.data.user_cat.catId;

            }, function errorCallback(e) {
                console.log(e);
            });

            $scope.submitNewArticle = function () {
                $scope.from = get('from');
                $ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addNewArticle")[0]);
                callAjax("POST", domain + "contentlibrary/save-article", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (response == '1') {
                        alert('Article added sucessfully.');
                        $state.go('app.content-library', {reload: true});
                    } else {
                        $state.go('app.content-library', {reload: true});
                    }
                });

            }
            $scope.tabclick = function (taburl) {
                jQuery('.notetab').hide();
                jQuery('#' + taburl).show();
                jQuery('.headtab span').removeClass('active');
                jQuery('.tab-buttons .tbtn').removeClass('active');
                jQuery('.headtab span[rel="' + taburl + '"]').addClass('active');
                jQuery('.tab-buttons .tbtn[rel="' + taburl + '"]').addClass('active');
            }
            $scope.isChecked = function () {
                if (jQuery("input[type='checkbox']:checked").length)
                {
                    $scope.checkboxval = false;
                } else {
                    $scope.checkboxval = true;
                }
            }

        })

        .controller('NewVideoArticleCtrl', function ($scope, $sce, $filter, $http, $state, $timeout, $stateParams, $ionicModal, $ionicLoading, $ionicScrollDelegate) {
            $scope.checkboxval = false;
            var wh = jQuery(window).height();
            // jQuery('.mediascreen').css('height', wh - 152);
            jQuery('.notetab').css('height', wh - 147);
            jQuery('.videoscreen').css('height', wh - 152);

            jQuery('.videoscreen').hide();

            $scope.doctorId = window.localStorage.getItem('id');


            $scope.sessionId = '';
            $scope.token = '';
            $scope.aid = '';
            $scope.opentok = '';
            $scope.url = '';
            $scope.viedoUrl = '';
            $scope.recording = 'Off';
//            $scope.timer = '00:00:00';
            var stoppedTimer;
            $scope.Timercounter = 0;


            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
            $http({
                method: 'GET',
                url: domain + 'contentlibrary/get-video-article-details',
                params: {doctorId: window.localStorage.getItem('id')}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                $scope.category = response.data.category;
                $scope.catId = response.data.user_cat.catId;
                $scope.target_groups = response.data.target_groups;
                $scope.languages = response.data.languages;
            }, function errorCallback(e) {
                console.log(e);
            });

            $scope.submitNewVideoArticle = function () {
                $scope.from = get('from');
                $ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addNewVideoArticle")[0]);
                callAjax("POST", domain + "contentlibrary/save-video-article", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (response == '1') {
                        $scope.viedoUrl = window.localStorage.removeItem('viedoUrl');
                        $scope.archiveId = window.localStorage.removeItem('archiveId');
                        alert('Video Article added sucessfully.');
                        $state.go('app.content-library', {reload: true});
                    } else {
                        $state.go('app.content-library', {reload: true});
                    }
                });

            }

            $scope.tabclick = function (taburl) {
                $ionicScrollDelegate.resize();
                $ionicScrollDelegate.scrollTop();

                jQuery('.notetab').hide();
                jQuery('#' + taburl).show();
                console.log(taburl + 'fasdfa');


                jQuery('.headtab span').removeClass('active');
                jQuery('.tab-buttons .tbtn').removeClass('active');
                jQuery('.headtab span[rel="' + taburl + '"]').addClass('active');
                jQuery('.tab-buttons .tbtn[rel="' + taburl + '"]').addClass('active');
                if (taburl == 'tabtwo')
                {
                    jQuery('.videoscreen').hide();
                    $scope.doctorId = window.localStorage.getItem('id');
                    $http({
                        method: 'GET',
                        url: domain + 'contentlibrary/get-video-start',
                        params: {doctorId: window.localStorage.getItem('id')}
                    }).then(function sucessCallback(response) {
                        console.log(response.data);
                        var aid = '';
                        var apiKey = '45121182';
                        var sessionId = response.data.sessionId;
                        var token = response.data.oToken;
                        $scope.sessionId = response.data.sessionId;
                        $scope.token = response.data.oToken;
                        $scope.opentok = response.data.opentok;
                        if (OT.checkSystemRequirements() == 1) {
                            session = OT.initSession(apiKey, sessionId);
                            $ionicLoading.hide();
                        } else {
                            $ionicLoading.hide();
                            alert("Your device is not compatible");
                        }


                        session.on({
                            streamCreated: function (event) {
                                subscriber = session.subscribe(event.stream, 'subscribersDiv', {subscribeToAudio: true, insertMode: "replace", width: "100%", height: "100%"});
                                console.log('Frame rates' + event.stream.frameRate);
                            },
                            sessionDisconnected: function (event) {
                                if (event.reason === 'networkDisconnected') {
                                    alert('You lost your internet connection.'
                                            + 'Please check your connection and try connecting again.');
                                }
                            }
                        });
                        session.connect(token, function (error) {
                            if (error) {
                                console.log(error.message);
                            } else {
                                jQuery('.start').show();
                                publisher = OT.initPublisher('subscribersDiv', {width: "100%", height: "100%"});
                                session.publish(publisher);

//                                publisher.on('streamCreated', function (event) {
//                                    console.log('Frame rate: ' + event.stream.frameRate);
//                                });
                                var mic = 1;
                                var mute = 1;
                                jQuery(".muteMic").click(function () {
                                    if (mic == 1) {
                                        publisher.publishAudio(false);
                                        mic = 0;
                                    } else {
                                        publisher.publishAudio(true);
                                        mic = 1;
                                    }
                                });
                                jQuery(".muteSub").click(function () {
                                    if (mute == 1) {
                                        subscriber.subscribeToAudio(false);
                                        mute = 0;
                                    } else {
                                        subscriber.subscribeToAudio(true);
                                        mute = 1;
                                    }
                                });
                            }
                        });
                    }, function errorCallback(e) {
                        console.log(e);
                    });



                    $scope.recordVideo = function () {
                        $scope.Timercounter = 0;
                        $scope.onTimeout = function () {
                            stoppedTimer = $timeout(function () {
                                $scope.Timercounter++;
                                $scope.seconds = $scope.Timercounter % 60;
                                $scope.minutes = Math.floor($scope.Timercounter / 60);
                                //  var mytimeout = $timeout($scope.onTimeout, 1000);
                                $scope.result = ($scope.minutes < 10 ? "0" + $scope.minutes : $scope.minutes);
                                $scope.result += ":" + ($scope.seconds < 10 ? "0" + $scope.seconds : $scope.seconds);
                                $scope.onTimeout();
                            }, 1000)
                        }

                        $timeout(function () {
                            $scope.onTimeout();
                        }, 0);

                        $scope.recording = 'On';
                        jQuery('.start').hide();
                        jQuery('.stop').show();
                        jQuery('.videoscreen').hide();
                        jQuery('.mediascreen').show();
                        jQuery('.next').hide();
                        jQuery('.rerecording').hide();


                        $http({
                            method: 'GET',
                            url: domain + 'contentlibrary/get-recording-start',
                            params: {archive: 1, sessionId: $scope.sessionId}
                        }).then(function sucessCallback(response) {
                            $scope.aid = response.data;
                        }, function errorCallback(e) {
                            console.log(e);
                        });

                    };


                    $scope.recordingStop = function () {
                        //alert('stoppedTimer ' + stoppedTimer);
                        // alert($scope.Timercounter);
                        $timeout.cancel(stoppedTimer);
                        publisher.destroy();
                        $scope.recording = 'Off';
                        jQuery('.stop').hide();
                        jQuery('.mediascreen').hide();
                        jQuery('.start').hide();
                        jQuery('.videoscreen').show();
                        jQuery('.next').show();
                        jQuery('.rerecording').show();


                        $http({
                            method: 'GET',
                            url: domain + 'contentlibrary/recording-stop',
                            params: {archiveStop: 1, archiveId: $scope.aid}
                        }).then(function sucessCallback(response) {
                            console.log(response.data);

                            $scope.playVideo($scope.aid);
//                            $http({
//                                method: 'GET',
//                                url: domain + 'contentlibrary/recording-response',
//                                params: {archiveId: $scope.aid}
//                            }).then(function sucessCallback(response) {
//                                console.log(response.data);
//                                $scope.url = response.data.url;
//                                window.localStorage.setItem('viedoUrl', $scope.url);
//                                window.localStorage.setItem('archiveId', $scope.aid);
//
//
//                            }, function errorCallback(e) {
//                                console.log(e);
//                            });



                        }, function errorCallback(e) {
                            console.log(e);
                        });
                    }

                    $scope.reRecording = function () {

                        $scope.Timercounter = 0;
                        jQuery('.videoscreen').hide();
                        jQuery('.mediascreen').show();
                        jQuery('.mediascreen').html('<div id="subscribersDiv" class="subscribediv">Initializing Video</div>');
                        jQuery('.next').hide();
                        jQuery('.rerecording').hide();
                        jQuery('.stop').hide();



                        $scope.doctorId = window.localStorage.getItem('id');
                        $http({
                            method: 'GET',
                            url: domain + 'contentlibrary/get-video-start',
                            params: {doctorId: window.localStorage.getItem('id')}
                        }).then(function sucessCallback(response) {
                            console.log(response.data);
                            var aid = '';
                            var apiKey = '45121182';
                            var sessionId = response.data.sessionId;
                            var token = response.data.oToken;
                            $scope.sessionId = response.data.sessionId;
                            $scope.token = response.data.oToken;
                            $scope.opentok = response.data.opentok;
                            if (OT.checkSystemRequirements() == 1) {
                                session = OT.initSession(apiKey, sessionId);
                                $ionicLoading.hide();
                            } else {
                                $ionicLoading.hide();
                                alert("Your device is not compatible");
                            }
                            session.on({
                                streamCreated: function (event) {
                                    subscriber = session.subscribe(event.stream, 'subscribersDiv', {subscribeToAudio: true, insertMode: "replace", width: "100%", height: "100%"});
                                },
                                sessionDisconnected: function (event) {
                                    if (event.reason === 'networkDisconnected') {
                                        alert('You lost your internet connection.'
                                                + 'Please check your connection and try connecting again.');
                                    }
                                }
                            });
                            session.connect(token, function (error) {
                                if (error) {
                                    console.log(error.message);
                                } else {
                                    // console.log("jhjagsdjagdhj");
                                    publisher = OT.initPublisher('subscribersDiv', {width: "100%", height: "100%"});
                                    session.publish(publisher);
                                    jQuery('.start').show();
//                                    publisher.on('streamCreated', function (event) {
//                                        console.log('Frame rate rerecording: ' + event.stream.frameRate);
//                                    });
//                                    var mic = 1;
//                                    var mute = 1;
//                                    jQuery(".muteMic").click(function () {
//                                        if (mic == 1) {
//                                            publisher.publishAudio(false);
//                                            mic = 0;
//                                        } else {
//                                            publisher.publishAudio(true);
//                                            mic = 1;
//                                        }
//                                    });
//                                    jQuery(".muteSub").click(function () {
//                                        if (mute == 1) {
//                                            subscriber.subscribeToAudio(false);
//                                            mute = 0;
//                                        } else {
//                                            subscriber.subscribeToAudio(true);
//                                            mute = 1;
//                                        }
//                                    });
                                }
                            });
                        }, function errorCallback(e) {
                            console.log(e);
                        });
                    }

                    $scope.trustSrc = function (src) {
                        return $sce.trustAsResourceUrl($filter('split')(src, '?', 0));
                    }



                    $ionicModal.fromTemplateUrl('viewvideo', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.modal = modal;
                    });

                    $scope.playVideo = function (archiveid) {
                        $ionicLoading.show({template: 'Retriving Video...'});
                        $http({
                            method: 'GET',
                            url: domain + 'contentlibrary/play-recent-video',
                            params: {archiveId: archiveid}
                        }).then(function sucessCallback(response) {
                            console.log(response.data);
                            //alert(response.data);
                            $scope.playurl = response.data;
                            if ($scope.playurl != '') {
                                $ionicLoading.hide();
                                // $scope.modal.show();
                            } else {
                                $scope.playVideo(archiveid);
                            }
                        }, function errorCallback(e) {
                            console.log(e);
                        });

                    }

                    $scope.playVideoPreview = function () {
                        $scope.modal.show();
                    }

                }


            }
            $scope.isChecked = function () {
                if (jQuery("input[type='checkbox']:checked").length)
                {
                    $scope.checkboxval = false;
                } else {
                    $scope.checkboxval = true;
                }
            }


        })

        .controller('DoctorRecordVideoCtrl', function ($scope, $http, $stateParams, $ionicModal, $ionicHistory, $ionicLoading, $state) {
            $scope.sessionId = '';
            $scope.token = '';
            $scope.aid = '';
            $scope.opentok = '';
            $scope.url = '';
            $scope.viedoUrl = '';
            $scope.doctorId = window.localStorage.getItem('id');
            $http({
                method: 'GET',
                url: domain + 'contentlibrary/get-video-start',
                params: {doctorId: window.localStorage.getItem('id')}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                var aid = '';
                var apiKey = '45121182';
                var sessionId = response.data.sessionId;
                var token = response.data.oToken;
                $scope.sessionId = response.data.sessionId;
                $scope.token = response.data.oToken;
                $scope.opentok = response.data.opentok;
                if (OT.checkSystemRequirements() == 1) {
                    session = OT.initSession(apiKey, sessionId);
                    $ionicLoading.hide();
                } else {
                    $ionicLoading.hide();
                    alert("Your device is not compatible");
                }
                session.on({
                    streamCreated: function (event) {
                        subscriber = session.subscribe(event.stream, 'subscribersDiv', {subscribeToAudio: true, insertMode: "replace", width: "100%", height: "100%"});
                    },
                    sessionDisconnected: function (event) {
                        if (event.reason === 'networkDisconnected') {
                            alert('You lost your internet connection.'
                                    + 'Please check your connection and try connecting again.');
                        }
                    }
                });
                session.connect(token, function (error) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        publisher = OT.initPublisher('subscribersDiv', {width: "100%", height: "100%"});
                        session.publish(publisher);
                        var mic = 1;
                        var mute = 1;
                        jQuery(".muteMic").click(function () {
                            if (mic == 1) {
                                publisher.publishAudio(false);
                                mic = 0;
                            } else {
                                publisher.publishAudio(true);
                                mic = 1;
                            }
                        });
                        jQuery(".muteSub").click(function () {
                            if (mute == 1) {
                                subscriber.subscribeToAudio(false);
                                mute = 0;
                            } else {
                                subscriber.subscribeToAudio(true);
                                mute = 1;
                            }
                        });
                    }
                });
            }, function errorCallback(e) {
                console.log(e);
            });

            $scope.recordVideo = function () {
                $http({
                    method: 'GET',
                    url: domain + 'contentlibrary/get-recording-start',
                    params: {archive: 1, sessionId: $scope.sessionId}
                }).then(function sucessCallback(response) {
                    $scope.aid = response.data;
                }, function errorCallback(e) {
                    console.log(e);
                });
            }

            $scope.recordingStop = function () {
                $http({
                    method: 'GET',
                    url: domain + 'contentlibrary/recording-stop',
                    params: {archiveStop: 1, archiveId: $scope.aid}
                }).then(function sucessCallback(response) {
                    console.log(response.data);

                    $http({
                        method: 'GET',
                        url: domain + 'contentlibrary/recording-response',
                        params: {archiveId: $scope.aid}
                    }).then(function sucessCallback(response) {
                        console.log(response.data);
                        $scope.url = response.data.url;
                        window.localStorage.setItem('viedoUrl', $scope.url);
                        window.localStorage.setItem('archiveId', $scope.aid);
                        $scope.naresh = window.localStorage.setItem('naresh', $scope.aid);

                        $state.go("app.new-video-article", {reload: true});
                    }, function errorCallback(e) {
                        console.log(e);
                    });
                    // $state.go("app.new-video-article", {reload: true});
                }, function errorCallback(e) {
                    console.log(e);
                });
            }

            $scope.exitVideo = function () {
                try {
                    publisher.destroy();
                    subscriber.destroy();
                    session.unsubscribe();
                    session.disconnect();
                    $ionicHistory.nextViewOptions({
                        historyRoot: true
                    })
                    $state.go("app.new-video-article", {reload: true});
                } catch (err) {
                    $ionicHistory.nextViewOptions({
                        historyRoot: true
                    })
                    $state.go("app.new-video-article", {reload: true});
                }
            };





        })

        .controller('LibraryFeedCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('PlaintestCtrl', function ($scope, $ionicModal) {
            $ionicModal.fromTemplateUrl('addeval', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('SnowmedtCtrl', function ($scope, $ionicModal) {
            $ionicModal.fromTemplateUrl('snomed', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('AddtreatmenttCtrl', function ($scope, $ionicModal) {
            $ionicModal.fromTemplateUrl('add-treatmentplan', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('AddmedicationCtrl', function ($scope, $ionicModal) {
            $ionicModal.fromTemplateUrl('add-medication', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('AddprocedureCtrl', function ($scope, $ionicModal) {
            $ionicModal.fromTemplateUrl('add-procedure', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('AddLifestyleCtrl', function ($scope, $ionicModal) {
            $ionicModal.fromTemplateUrl('add-lifestyle', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('AddReferralCtrl', function ($scope, $ionicModal) {
            $ionicModal.fromTemplateUrl('add-referral', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('LoincCtrl', function ($scope, $ionicModal) {
            $ionicModal.fromTemplateUrl('loinc', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('IcdCtrl', function ($scope, $ionicModal) {
            $ionicModal.fromTemplateUrl('icd', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('AddrelationCtrl', function ($scope, $ionicModal) {
            $ionicModal.fromTemplateUrl('addrelation', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('PlaintestCtrl', function ($scope, $ionicModal) {
            $ionicModal.fromTemplateUrl('addeval', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('treaTmentpCtrl', function ($scope, $ionicModal, $state) {
            $ionicModal.fromTemplateUrl('treatmentp', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
            $scope.modalclose = function (ulink) {
                $state.go(ulink);
                $scope.modal.hide();
            }
        })

        .controller('CloseModalCtrl', function ($scope, $ionicModal, $state) {
            $scope.modalclose = function (ulink) {
                $state.go(ulink);
                $scope.modal.hide();
            }
        })

        .controller('knowConditionCtrl', function ($scope, $ionicModal, $state) {
            $ionicModal.fromTemplateUrl('knowcondition', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('CancelDoctrscheCtrl', function ($scope, $ionicModal) {
            $ionicModal.fromTemplateUrl('snomed', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('ConsultationsNoteCtrl', function ($scope, $http, $stateParams, $rootScope, $state, $compile, $ionicModal, $ionicHistory, $timeout, $filter, $cordovaCamera, $ionicLoading) {
            var imgCnt = 0;
            console.log("Measure = " + $rootScope.measurement + "Obj = " + $rootScope.objId + "Dia = " + $rootScope.diaId);
            if ($rootScope.diaId) {
                //$ionicModal.hide();
            }
            $scope.appId = $stateParams.appId;
            $scope.patientName = [{'name': 'No Patient selected'}];
            window.localStorage.setItem('appId', $scope.appId);
            $scope.mode = '';
            $scope.catId = '';
            $scope.recId = $rootScope.recCId;
            $scope.caseId = '';
            $scope.userId = window.localStorage.getItem('id');
            $scope.prescription = 'Yes';
            $scope.images = [];
            $scope.image = [];
            $scope.tempImgs = [];
            if ($scope.appId != 0) {
                console.log('get appointment details' + $scope.appId);
                $http({
                    method: "GET",
                    url: domain + "doctrsrecords/get-app-details",
                    params: {appId: $scope.appId}
                }).then(function successCallback(response) {
                    console.log(response.data.patient.id);
                    $scope.patientId = response.data.patient.id;
                    $scope.doctorId = response.data.doctr.id
                    $scope.app = response.data.app;
                    $scope.record = response.data.record;
                    $scope.recordDetails = response.data.recordDetails;
                    if (response.data.app.mode == 1) {
                        $scope.mode = 'Video';
                    } else if (response.data.app.mode == 2) {
                        $scope.mode = 'Chat';
                    } else if (response.data.app.mode = 3) {
                        $scope.mode = 'Clinic'
                    } else if (response.data.app.mode == 4) {
                        $scope.mode = 'Home';
                    }
                    console.log($scope.mode);
                    $scope.pType = 'Outpatient';
                    $scope.conDate = $filter('date')(new Date(response.data.app.scheduled_start_time), 'dd-MM-yyyy'); //response.data.app.scheduled_start_time; //$filter('date')(new Date(), 'MM-dd-yyyy');
                    $scope.curTimeo = $filter('date')(new Date(response.data.app.scheduled_start_time), 'hh:mm a');
                    $scope.curTime = new Date();
                    window.localStorage.setItem('patientId', $scope.patientId);
                    window.localStorage.setItem('doctorId', $scope.doctorId);
                    console.log($scope.conDate);
                    $http({
                        method: 'GET',
                        url: domain + 'doctrsrecords/get-fields',
                        params: {patient: $scope.patientId, userId: $scope.userId, catId: $scope.catId, recId: $scope.recId}
                    }).then(function successCallback(response) {
                        console.log(response.data);
                        $scope.record = response.data.record;
                        $scope.fields = response.data.fields;
                        $scope.problems = response.data.problems;
                        $scope.doctrs = response.data.doctrs;
                        $scope.patients = response.data.patients;
                        $scope.cases = response.data.cases;
                        //Patient And Family Details
                        $rootScope.$emit("GetPatientDetails", ($scope.patientId));
                        $rootScope.$emit("GetFamilyDetails", ($scope.patientId));
                        $scope.preRec = response.data.recordData;
                        $scope.preRecData = response.data.recordDetails;
                        angular.forEach($scope.preRecData, function (val, key) {
                            if (val.fields.field == 'case-id') {
                                $scope.casetype = '0';
                                $scope.caseId = val.value;
                            }
                            if (val.attachments.length > 0) {
                                jQuery('#coninprec').removeClass('hide');
                            }
                            if (val.fields.field == 'Includes Prescription') {
                                $scope.prescription = val.value;
                                if (val.value == 'Yes') {
                                    jQuery('#convalid').removeClass('hide');
                                }
                            }
                        });
                    }, function errorCallback(response) {
                        console.log(response);
                    });
                }, function errorCallback(e) {
                    console.log(e);
                });
            } else {
                store({'from': 'app.homepage'});
                console.log('----' + get('patientId') + '---');
                if (get('patientId') == 0) {
                    $scope.patientId = '';
                    $scope.doctorId = get('id');
                    $scope.patientName = [{'name': 'No Patient selected'}];
                    window.localStorage.setItem('patientId', '0');
                    window.localStorage.setItem('doctorId', $scope.doctorId);
                } else {
                    console.log("patient set");
                    $scope.patientId = get('patientId');
                    $scope.doctorId = get('id');
                }
                $scope.conDate = new Date();
                $scope.curTime = new Date();
                $scope.curTimeo = $filter('date')(new Date(), 'hh:mm');
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/get-fields',
                    params: {patient: $scope.patientId, userId: $scope.userId, catId: $scope.catId, recId: $scope.recId}
                }).then(function successCallback(response) {
                    console.log(response.data);
                    $scope.record = response.data.record;
                    $scope.fields = response.data.fields;
                    $scope.problems = response.data.problems;
                    $scope.doctrs = response.data.doctrs;
                    $scope.patients = response.data.patients;
                    $scope.cases = response.data.cases;
                    $scope.preRec = response.data.recordData;
                    $scope.preRecData = response.data.recordDetails;
                    if ($scope.preRecData.length > 0) {
                        angular.forEach($scope.preRecData, function (val, key) {
                            console.log(val.value);
                            if (val.fields.field == 'Case Id') {
                                $scope.casetype = '0';
                                $scope.caseId = val.value;
                            }
                            if (val.fields.field == 'Attachments') {
                                console.log("Attach length " + val.attachments.length);
                                if (val.attachments.length > 0) {
                                    jQuery('#coninprec').removeClass('hide');
                                }
                            }
                            if (val.fields.field == 'Includes Prescription') {
                                $scope.prescription = val.value;
                                if (val.value == 'Yes') {
                                    jQuery('#convalid').removeClass('hide');
                                }
                            }
                            if (val.fields.field == 'Valid till') {
                                $scope.validTill = $filter('date')(new Date(val.value), 'dd-MM-yyyy');
                            }
                            if (val.fields.field == 'Consultation Date') {
                                $scope.conDate = $filter('date')(new Date(val.value), 'MM-dd-yyyy');
                            }
                            if (val.fields.field == 'Consultation Time') {
                                $scope.curTimeo = $filter('date')(new Date(val.value), 'hh:mm a');
                            }
                            if (val.fields.field == 'Patient Type') {
                                $scope.pType = val.value;
                            }
                            if (val.fields.field == 'Mode') {
                                $scope.mode = val.value;
                            }
                        });
                    } else {
                        $scope.conDate = new Date();
                        $scope.curTimeo = $filter('date')(new Date(), 'hh:mm');
                    }
                    console.log("Con date " + $scope.conDate);
                    console.log("Con Time " + $scope.curTimeo);
                    angular.forEach($scope.patients, function (value, key) {
                        if (value.id == $scope.patientId) {
                            $scope.patientName = [{'name': value.fname}];
                        }
                    });
                    if ($scope.patients.length > 0) {
                        var data = $scope.patients;
                        $scope.users = _.reduce(
                                data,
                                function (output, fname) {
                                    var lCase = fname.fname.toUpperCase();
                                    if (output[lCase[0]]) //if lCase is a key
                                        output[lCase[0]].push(fname); //Add name to its list
                                    else
                                        output[lCase[0]] = [fname]; // Else add a key
                                    //console.log(output);
                                    return output;
                                },
                                {}
                        );
                    }
                }, function errorCallback(response) {
                    console.log(response);
                });
            }
            $scope.selPatient = function (pid, name) {
                console.log(pid + "Name = " + name);
                $scope.patientId = pid;
                window.localStorage.setItem('patientId', pid);
                $scope.getPatientId(pid);
                $scope.patientName = [{'name': name}];
                console.log($scope.patientName);
                $rootScope.$emit("GetPatientDetails", (pid));
                $rootScope.$emit("GetFamilyDetails", (pid));
                $scope.modal.hide();
            };

            $scope.gotopage = function (glink) {
                $state.go(glink);
            };
            $scope.getPatientId = function (pid) {
                console.log(pid);
                $scope.patientId = pid;
                $rootScope.patientId = pid;
                window.localStorage.setItem('patientId', pid);
                if ($scope.doctorId) {
                    if ($scope.patientId != 0) {
                        console.log('call cases');
                        $http({
                            method: 'GET',
                            url: domain + 'doctrsrecords/get-cases',
                            params: {patientId: $scope.patientId, doctrId: $scope.doctorId}
                        }).then(function successCallback(response) {
                            console.log(response);
                            $scope.cases = response.data;
                        }, function errorCallback(response) {
                            console.log(response);
                        });
                    }
                }
            };
            $scope.getDrId = function (did) {
                console.log(did);
                $scope.doctorId = did;
                $rootScope.doctorId = did;
                window.localStorage.setItem('doctorId', did);
                if ($scope.doctorId) {
                    if ($scope.patientId != 0) {
                        console.log('call cases');
                        $http({
                            method: 'GET',
                            url: domain + 'doctrsrecords/get-cases',
                            params: {patientId: $scope.patientId, doctrId: $scope.doctorId}
                        }).then(function successCallback(response) {
                            console.log(response);
                            $scope.cases = response.data;
                        }, function errorCallback(response) {
                            console.log(response);
                        });
                    }
                }
            };
            $scope.check = function (pid, did) {
                console.log("Patient = " + pid + " dr Id = " + did);
                if (pid == '' && did == '' || (pid == null && did == null)) {
                    alert("Please select doctor and patient.");
                } else if (pid == '' || pid == null) {
                    alert("Please select patient.");
                } else if (did == '' || did == null) {
                    alert("Please select doctor.");
                } else {
                    $state.go('app.notetype');
                }
            };
            //Save FormData
            $scope.submit = function () {
                $scope.from = get('from');
                $ionicLoading.show({template: 'Adding...'});
                //alert($scope.tempImgs.length);
                if ($scope.tempImgs.length > 0) {
                    angular.forEach($scope.tempImgs, function (value, key) {
                        $scope.picData = getImgUrl(value);
                        var imgName = value.substr(value.lastIndexOf('/') + 1);
                        $scope.ftLoad = true;
                        var imup = $scope.uploadPicture();
                        alert("Image upload var " + imup);
                        $scope.image.push(imgName);
                        console.log($scope.image);
                    });
                    jQuery('#camfilee').val($scope.image);
                    console.log($scope.images);
                    var data = new FormData(jQuery("#addRecordForm")[0]);
                    callAjax("POST", domain + "doctrsrecords/save-consultation", data, function (response) {
                        console.log(response);
                        $ionicLoading.hide();
                        if (angular.isObject(response.records)) {
                            $scope.image = [];
                            $scope.recId = response.records.id;
                            $rootScope.recCId = $scope.recId;
                            jQuery('.cnoteid').val(response.records.id);
                            $scope.saveMeasurements();
                            $rootScope.$emit("SavePatient", {});
                            $rootScope.$emit("SaveObjservation", (response.records.id));
                            $rootScope.$emit("SaveTestResult", (response.records.id));
                            $rootScope.$emit("SaveDigno", (response.records.id));
                            $ionicHistory.nextViewOptions({
                                historyRoot: true
                            });
                            alert("Consultation Note added successfully!");
                            if ($scope.from == 'app.appointment-list')
                                $state.go('app.appointment-list', {}, {reload: true});
                            else if ($scope.from == 'app.past-appointment-list')
                                $state.go('app.past-appointment-list', {}, {reload: true});
                            else if ($scope.from == 'app.patient-app-list')
                                $state.go('app.patient-app-list', {'id': $scope.patientId}, {reload: true});
                            else if ($scope.from == 'app.patient-past-app-list')
                                $state.go('app.patient-app-list', {'id': $scope.patientId}, {reload: true});
                            else if ($scope.from == 'app.doctor-consultations')
                                $state.go('app.doctor-consultations', {'id': $scope.doctorId}, {reload: true});
                            else if ($scope.from == 'app.consultation-past')
                                $state.go('app.consultation-past', {'id': $scope.doctorId}, {reload: true});
                            else
                                $state.go('app.homepage', {}, {reload: true});
                        } else if (response.err != '') {
                            alert('Please fill mandatory fields');
                        }
                    });
                } else {
                    var data = new FormData(jQuery("#addRecordForm")[0]);
                    callAjax("POST", domain + "doctrsrecords/save-consultation", data, function (response) {
                        console.log(response);
                        $ionicLoading.hide();
                        if (angular.isObject(response.records)) {
                            $scope.recId = response.records.id;
                            $rootScope.recCId = $scope.recId;
                            jQuery('.cnoteid').val(response.records.id);
                            $scope.saveMeasurements();
                            $rootScope.$emit("SavePatient", {});
                            $rootScope.$emit("SaveObjservation", (response.records.id));
                            $rootScope.$emit("SaveTestResult", (response.records.id));
                            $rootScope.$emit("SaveDigno", (response.records.id));
                            $ionicHistory.nextViewOptions({
                                historyRoot: true
                            });
                            alert("Consultation Note added successfully!");
                            if ($scope.from == 'app.appointment-list')
                                $state.go('app.appointment-list', {}, {reload: true});
                            else if ($scope.from == 'app.past-appointment-list')
                                $state.go('app.past-appointment-list', {}, {reload: true});
                            else if ($scope.from == 'app.patient-app-list')
                                $state.go('app.patient-app-list', {'id': $scope.patientId}, {reload: true});
                            else if ($scope.from == 'app.patient-past-app-list')
                                $state.go('app.patient-app-list', {'id': $scope.patientId}, {reload: true});
                            else if ($scope.from == 'app.doctor-consultations')
                                $state.go('app.doctor-consultations', {'id': $scope.doctorId}, {reload: true});
                            else if ($scope.from == 'app.consultation-past')
                                $state.go('app.consultation-past', {'id': $scope.doctorId}, {reload: true});
                            else
                                $state.go('app.homepage', {}, {reload: true});
                        } else if (response.err != '') {
                            alert('Please fill mandatory fields');
                        }
                    });
                }

                function getImgUrl(imageName) {
                    var name = imageName.substr(imageName.lastIndexOf('/') + 1);
                    var trueOrigin = cordova.file.dataDirectory + name;
                    return trueOrigin;
                }
            };
            $scope.saveMeasurements = function () {
                jQuery('#patientId').val($scope.patientId);
                console.log("From Consultation Note - Measurements");
                var data = new FormData(jQuery("#addMeasureForm")[0]);
                console.log(data);
                callAjax("POST", domain + "doctrsrecords/save-measurements", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (response.err == '') {
                        //alert("Measurements saved successfully!");
                        $rootScope.measure = 'yes';
                        $rootScope.measurement = response.records;
                        //$state.go('app.notetype');
                        //$state.go('app.consultations-note', {'appId': $scope.appId}, {reload: true});
                    } else if (response.err != '') {
                        alert('Please fill mandatory fields');
                    }
                });
            };
            $scope.getCase = function (type) {
                console.log(type);
                if ($scope.patientId == '') {
                    alert("Please select Patient");
                }
                if (type == 1) {
                    jQuery(".fields #precase").addClass('hide');
                    jQuery(".fields #newcase").removeClass('hide');
                } else if (type == 0) {
                    jQuery(".fields #precase").removeClass('hide');
                    jQuery(".fields #newcase").addClass('hide');
                }
            };
            //Take images with camera
            $scope.takePict = function (name) {
                //console.log(name);
                var camimg_holder = $("#camera-status");
                //camimg_holder.empty();
                // 2
                var options = {
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                };
                // 3
                $cordovaCamera.getPicture(options).then(function (imageData) {
                    //alert(imageData);
                    onImageSuccess(imageData);
                    function onImageSuccess(fileURI) {
                        createFileEntry(fileURI);
                    }
                    function createFileEntry(fileURI) {
                        window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
                    }
                    // 5
                    function copyFile(fileEntry) {
                        var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                        var newName = makeid() + name;
                        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (fileSystem2) {
                            fileEntry.copyTo(
                                    fileSystem2,
                                    newName,
                                    onCopySuccess,
                                    fail
                                    );
                        },
                                fail);
                    }
                    // 6
                    function onCopySuccess(entry) {
                        var imageName = entry.nativeURL;
                        $scope.$apply(function () {
                            $scope.tempImgs.push(imageName);
                        });
                        console.log($scope.tempImgs.length);
                        if ($scope.tempImgs.length == 0) {
                            console.log($("#image-holder").html());
                            if (($("#image-holder").html()) == '') {
                                jQuery('#convalid').addClass('hide');
                                jQuery('#coninprec').addClass('hide');
                            } else {
                                jQuery('#convalid').removeClass('hide');
                                jQuery('#coninprec').removeClass('hide');
                            }
                        } else {
                            jQuery('#convalid').removeClass('hide');
                            jQuery('#coninprec').removeClass('hide');
                        }
                        $scope.picData = getImgUrl(imageName);
                        //alert($scope.picData);
                        $scope.ftLoad = true;
                        imgCnt++;
                        var btnhtml = $compile('<div class="remcam-' + imgCnt + '"><button class="button button-positive remove" ng-click="removeCamFile(\'' + imgCnt + '\')">X</button></div>')($scope);
                        camimg_holder.append(btnhtml);
                        $('<div class="remcam-' + imgCnt + '"><span class="upattach"><i class="ion-paperclip"></i></span></div>').appendTo(camimg_holder);
                    }
                    function fail(error) {
                        console.log("fail: " + error.code);
                    }
                    function makeid() {
                        var text = "";
                        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                        for (var i = 0; i < 5; i++) {
                            text += possible.charAt(Math.floor(Math.random() * possible.length));
                        }
                        return text;
                    }
                    function getImgUrl(imageName) {
                        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
                        var trueOrigin = cordova.file.dataDirectory + name;
                        return trueOrigin;
                    }
                }, function (err) {
                    console.log(err);
                });
            };
            $scope.uploadPicture = function () {
                //$ionicLoading.show({template: 'Uploading..'});
                var fileURL = $scope.picData;
                var name = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                options.mimeType = "image/jpeg";
                options.chunkedMode = true;
                var params = {};
//                params.value1 = "someparams";
//                params.value2 = "otherparams";
//                options.params = params;
                var uploadSuccess = function (r) {
                    alert('Upload Success !!!');
                    console.log("Code = " + r.responseCode);
                    console.log("Response = " + r.response);
                    console.log("Sent = " + r.bytesSent);
                    //$scope.image.push(name);
                    //$ionicLoading.hide();
                }
                var ft = new FileTransfer();
                ft.upload(fileURL, encodeURI(domain + 'doctrsrecords/upload-attachment'), uploadSuccess, function (error) {
                    console.log("Error in uploading!!!");
                    //$ionicLoading.show({template: 'Error in connecting...'});
                    //$ionicLoading.hide();
                }, options);
            };
            $scope.setFile = function (element) {
                $scope.currentFile = element.files[0];
                console.log('length = ' + element.files.length);
                var image_holder = $("#image-holder");
                image_holder.empty();
                if (element.files.length > 0) {
                    console.log($("#camera-status").html());
                    jQuery('#convalid').removeClass('hide');
                    jQuery('#coninprec').removeClass('hide');
                    //jQuery('#valid-till').attr('required', true);
                    image_holder.append('<button class="button button-positive remove" onclick="removeFile()">Remove Files</button><br/>');
                } else {
                    if (($("#camera-status").html()) != '') {
                        jQuery('#convalid').removeClass('hide');
                        jQuery('#coninprec').removeClass('hide');
                    } else {
                        jQuery('#convalid').addClass('hide');
                        jQuery('#coninprec').addClass('hide');
                    }
                    //jQuery('#valid-till').attr('required', false);
                }
                if (typeof (FileReader) != "undefined") {
                    //loop for each file selected for uploaded.
                    for (var i = 0; i < element.files.length; i++) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
//                            $("<img />", {
//                                "src": e.target.result,
//                                "class": "thumb-image"
//                            }).appendTo(image_holder);
                            //$scope.images.push(e.target.result);
                            $('<span class="upattach"><i class="ion-paperclip"></i></span>').appendTo(image_holder);
                        }
                        image_holder.show();
                        reader.readAsDataURL(element.files[0]);
                    }
                }
            };
            $scope.removeCamFile = function (img) {
                var arrInd = (img - 1);
                var index = $scope.tempImgs.indexOf(arrInd);
                $scope.tempImgs.splice(index, 1);
                console.log('camera file removed');
                console.log($scope.tempImgs.length);
                jQuery('.remcam-' + img).remove();
                if ($scope.tempImgs.length == 0) {
                    if (($("#image-holder").html()) == '') {
                        jQuery('#convalid').addClass('hide');
                        jQuery('#coninprec').addClass('hide');
                    } else {
                        jQuery('#convalid').removeClass('hide');
                        jQuery('#coninprec').removeClass('hide');
                    }
                } else {
                    jQuery('#convalid').removeClass('hide');
                    jQuery('#coninprec').removeClass('hide');
                }
            };
            $scope.getPrescription = function (pre) {
                console.log('pre ' + pre);
                if (pre === ' No') {
                    console.log("no");
                    jQuery('#convalid').addClass('hide');
                } else if (pre === 'Yes') {
                    console.log("yes");
                    jQuery('#convalid').removeClass('hide');
                }
            };
            $ionicModal.fromTemplateUrl('selectpatient', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();

            };
            /* new added */
            $scope.shownext = function (bd, ab) {
                jQuery('#' + bd).hide();
                jQuery('#' + ab).show();
                jQuery('.headtab span').removeClass('active');
                jQuery('.headtab span[rel="' + ab + '"]').addClass('active');
            };

            $scope.accordiantab = function (pq) {
                //jQuery('#'+pq).toggleClass('active');
                jQuery('#' + pq).slideToggle();
                // jQuery(this).toggleClass('active');
            };

            $scope.tabclick = function (taburl) {
                jQuery('.notetab').hide();
                jQuery('#' + taburl).show();
                jQuery('.headtab span').removeClass('active');
                jQuery('.tab-buttons .tbtn').removeClass('active');
                jQuery('.headtab span[rel="' + taburl + '"]').addClass('active');
                jQuery('.tab-buttons .tbtn[rel="' + taburl + '"]').addClass('active');
            };
            /* end*/
        })

        .controller('NotetypeCtrl', function ($scope, $http, $ionicModal, $state) {
            $scope.userId = window.localStorage.getItem('id');
            $scope.modalclose = function (ulink) {
                $state.go(ulink);
            };
        })

        .controller('FamilyHistoryCtrl', function ($scope, $http, $state, $ionicModal, $ionicLoading, $rootScope) {
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.catId = 'Family History';
            $scope.conId = [];
            $scope.conIds = [];
            $scope.famHist = [];
            $scope.selConditions = [];
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-family-history',
                params: {patient: $scope.patientId, userId: $scope.userId, doctorId: $scope.doctorId, catId: $scope.catId}
            }).then(function successCallback(response) {
                $scope.record = response.data.record;
                $scope.recorddata = response.data.recorddata;
                $scope.knConditions = response.data.recConditions;
                $scope.fields = response.data.fields;
                $scope.problems = response.data.problems;
                $scope.doctrs = response.data.doctrs;
                $scope.patients = response.data.patients;
                $scope.cases = response.data.cases;
                $scope.abt = response.data.abt;
                $scope.conditions = response.data.conditions;
                $scope.selCondition = response.data.knConditions;
                $scope.familyhistory = response.data.familyhistory;
//                if ($scope.selCondition.length > 0) {
//                    angular.forEach($scope.selCondition, function (val, key) {
//                        $scope.conIds.push(val.id);
//                        $scope.selConditions.push({'condition': val.condition});
//                    });
//                }
            }, function errorCallback(response) {
                console.log(response);
            });

            $ionicModal.fromTemplateUrl('addrelation', {
                scope: $scope
            }).then(function (modal) {
                $scope.conIds = [];
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };

            $rootScope.$on("GetFamilyDetails", function (pid) {
                $scope.getFamHistory(pid);
            });

            $scope.getFamHistory = function (pid) {
                console.log($rootScope.patientId);
                if ($rootScope.patientId) {
                    $scope.patientId = $rootScope.patientId;
                } else {
                    $scope.patientId = get('patientId');
                    $scope.doctorId = get('doctorId');
                }
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/get-family-history',
                    params: {patient: $scope.patientId, userId: $scope.userId, doctorId: $scope.doctorId, catId: $scope.catId}
                }).then(function successCallback(response) {
                    $scope.record = response.data.record;
                    $scope.recorddata = response.data.recorddata;
                    $scope.knConditions = response.data.recConditions;
                    $scope.fields = response.data.fields;
                    $scope.problems = response.data.problems;
                    $scope.doctrs = response.data.doctrs;
                    $scope.patients = response.data.patients;
                    $scope.cases = response.data.cases;
                    $scope.abt = response.data.abt;
                    $scope.conditions = response.data.conditions;
                    $scope.selCondition = response.data.knConditions;
                    $scope.familyhistory = response.data.familyhistory;
//                    if ($scope.selCondition.length > 0) {
//                        angular.forEach($scope.selCondition, function (val, key) {
//                            $scope.conIds.push(val.id);
//                            $scope.selConditions.push({'condition': val.condition});
//                        });
//                    }
                }, function errorCallback(response) {
                    console.log(response);
                });
            };
            $scope.getCondition = function (id, con) {
                console.log(id + "==" + con);
                var con = con.toString();
                if ($scope.conId[id]) {
                    $scope.conIds.push(id);
                    $scope.selConditions.push({'condition': con});
                } else {
                    var index = $scope.conIds.indexOf(id);
                    $scope.conIds.splice(index, 1);
                    for (var i = $scope.selConditions.length - 1; i >= 0; i--) {
                        if ($scope.selConditions[i].condition == con) {
                            $scope.selConditions.splice(i, 1);
                        }
                    }
                }
                jQuery("#selconFam").val($scope.conIds);
                console.log($scope.selConditions);
                console.log($scope.conIds);
            };
            $scope.saveFamilyHistory = function () {
                if ($rootScope.patientId) {
                    $scope.patientId = $rootScope.patientId;
                }
                jQuery('#patientId').val($scope.patientId);
                //alert('dsfsdf');
                $ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addFamilyForm")[0]);
                // alert(data);
                console.log(data);
                callAjax("POST", domain + "doctrsrecords/save-family-history", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (angular.isObject(response.records)) {
                        alert("Family History saved successfully!");
                        jQuery("#addFamilyForm")[0].reset();
                        $scope.famHist.push(response.records.id);
                        $rootScope.famHist = $scope.famHist;
                        $scope.getFamHistory();
                        // $state.go('app.notetype',{reload: true});
                        $scope.modal.hide();
                        //$state.go('app.family-history', {}, {reload: true});
                        ////window.location.reload();
                        //$state.go('app.consultations-note', {'appId': $scope.appId}, {reload: true});
                    } else if (response.err != '') {
                        alert('Please fill mandatory fields');
                    }
                });
            };
        })

        .controller('PatientHistoryCtrl', function ($scope, $http, $stateParams, $state, $rootScope, $ionicModal, $timeout, $filter, $cordovaCamera, $ionicLoading) {
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id'); //$stateParams.drId
            $scope.catId = 'Patient History';
            $scope.conId = [];
            $scope.conIds = [];
            $scope.gender = '';
            $scope.gend = '';
            $scope.selConditions = [];
            $scope.curTime = new Date();
            $scope.curTimeo = $filter('date')(new Date(), 'hh:mm a');
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-about-fields',
                params: {patient: $scope.patientId, userId: $scope.userId, doctorId: $scope.doctorId, catId: $scope.catId}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.record = response.data.record;
                $scope.fields = response.data.fields;
                $scope.problems = response.data.problems;
                $scope.doctrs = response.data.doctrs;
                $scope.patients = response.data.patients;
                $scope.cases = response.data.cases;
                $scope.abt = response.data.abt;
                $scope.dob = new Date(response.data.dob);
                //$scope.dob = $filter('date')(response.data.dob, 'MM dd yyyy');
                if ($scope.abt.length > 0) {
                    angular.forEach($scope.abt, function (val, key) {
                        console.log(val.fields.field + "==" + val.value);
                        var field = val.fields.field;
                        if (field.toString() == 'Gender') {
                            console.log(field);
                            $scope.gender = val.value;
                            console.log(val.value);
                            if (val.value == 1) {
                                $scope.gender = 'Male';
                            } else if (val.value == 2) {
                                $scope.gender = 'Female';
                            }
                        }
                    });
                } else {
                    if (response.data.patients[0].gender == 1) {
                        $scope.gender = 'Male';
                    } else if (response.data.patients[0].gender == 2) {
                        $scope.gender = 'Female';
                    }
                }
                console.log($scope.gender);
                $scope.selCondition = response.data.knConditions;
                if ($scope.selCondition.length > 0) {
                    angular.forEach($scope.selCondition, function (val, key) {
                        $scope.conIds.push(val.id);
                        $scope.selConditions.push({'condition': val.condition});
                    });
                }
                $scope.conditions = response.data.conditions;
                console.log($scope.conIds);
            }, function errorCallback(response) {
                console.log(response);
            });
            $rootScope.$on("GetPatientDetails", function (pid) {
                $scope.getPatDetails(pid);
            });
            $rootScope.$on("SavePatient", function (pid) {
                $scope.savePatientHistory();
            });

            $scope.getPatDetails = function (pid) {
                console.log(pid);
                console.log($rootScope.patientId);
                if ($rootScope.patientId) {
                    $scope.patientId = $rootScope.patientId;
                } else {
                    $scope.patientId = get('patientId');
                    $scope.doctorId = get('doctorId');
                }
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/get-about-fields',
                    params: {patient: $scope.patientId, userId: $scope.userId, doctorId: $scope.doctorId, catId: $scope.catId}
                }).then(function successCallback(response) {
                    console.log(response.data);
                    $scope.record = response.data.record;
                    $scope.fields = response.data.fields;
                    $scope.problems = response.data.problems;
                    $scope.doctrs = response.data.doctrs;
                    $scope.patients = response.data.patients;
                    $scope.cases = response.data.cases;
                    $scope.abt = response.data.abt;
                    $scope.dob = new Date(response.data.dob);
                    //$scope.dob = $filter('date')(response.data.dob, 'MM dd yyyy');
                    if ($scope.abt.length > 0) {
                        angular.forEach($scope.abt, function (val, key) {
                            console.log(val.fields.field + "==" + val.value);
                            var field = val.fields.field;
                            if (field.toString() == 'Gender') {
                                console.log(field);
                                $scope.gender = val.value;
                                console.log(val.value);
                                if (val.value == 1) {
                                    $scope.gender = 'Male';
                                } else if (val.value == 2) {
                                    $scope.gender = 'Female';
                                }
                            }
                        });
                    } else {
                        if (response.data.patients[0].gender == 1) {
                            $scope.gender = 'Male';
                        } else if (response.data.patients[0].gender == 2) {
                            $scope.gender = 'Female';
                        }
                    }
                    console.log($scope.gender);
                    $scope.selCondition = response.data.knConditions;
                    if ($scope.selCondition.length > 0) {
                        angular.forEach($scope.selCondition, function (val, key) {
                            $scope.conIds.push(val.id);
                            $scope.selConditions.push({'condition': val.condition});
                        });
                    }
                    $scope.conditions = response.data.conditions;
                    console.log($scope.conIds);
                }, function errorCallback(response) {
                    console.log(response);
                });
            };
            $scope.gotopage = function (glink) {
                $state.go(glink);
            };
            $scope.getCondition = function (id, con) {
                console.log(id + "==" + con);
                var con = con.toString();
                if ($scope.conId[id]) {
                    $scope.conIds.push(id);
                    $scope.selConditions.push({'condition': con});
                } else {
                    var index = $scope.conIds.indexOf(id);
                    $scope.conIds.splice(index, 1);
                    for (var i = $scope.selConditions.length - 1; i >= 0; i--) {
                        if ($scope.selConditions[i].condition == con) {
                            $scope.selConditions.splice(i, 1);
                        }
                    }
                }
                jQuery("#selcon").val($scope.conIds);
                console.log($scope.selConditions);
            };
            $scope.getCheck = function (gen) {
                console.log(gen);
            };
            $scope.getPreCon = function (conId) {
                if ($scope.conIds.indexOf(conId) != -1)
                    return 1;
                else
                    return 0;
//                for (var i = $scope.selConditions.length - 1; i >= 0; i--) {
//                    if($scope.conIds.indexOf(conId)!= -1)
//                        return 1;
//                    else return 0;
//                }
            };
            //Save Patient History
            $scope.savePatientHistory = function () {
                //$ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addPatientForm")[0]);
                callAjax("POST", domain + "doctrsrecords/save-patient-history", data, function (response) {
                    console.log(response);
                    //$ionicLoading.hide();
                    if (angular.isObject(response.records)) {
                        //alert("Patient History saved successfully!");
                        //$state.go('app.consultations-note', {'appId': $scope.appId}, {}, {reload: true});
                    } else if (response.err != '') {
                        //alert('Please fill mandatory fields');
                    }
                });
            };
            //Save Patient History
            $scope.vsavePatientHistory = function () {
                $ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#adddPatientForm")[0]);
                callAjax("POST", domain + "doctrsrecords/save-patient-history", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (angular.isObject(response.records)) {
                        alert("Patient History saved successfully!");
                        console.log('remove slide');
                        jQuery('.ciframecontainer').removeClass('active');
                    } else if (response.err != '') {
                        //alert('Please fill mandatory fields');
                    }
                });
            };
        })

        .controller('MeasurementCtrl', function ($scope, $http, $stateParams, $state, $rootScope, $ionicModal, $timeout, $filter, $cordovaCamera, $ionicLoading) {
            console.log($stateParams.mid);
            $scope.mid = $stateParams.mid;
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.catId = 'Measurements';
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-measure-fields',
                params: {patient: $scope.patientId, userId: $scope.userId, doctor: $scope.doctorId, catId: $scope.catId, mid: $stateParams.mid}
            }).then(function successCallback(response) {
                console.log(response);
                $scope.records = response.data.record;
                $scope.fields = response.data.fields;
                $scope.editRec = response.data.editRec;
                $scope.abt = response.data.abt;
                $scope.measurement = response.data.measurement;
            }, function errorCallback(response) {
                console.log(response);
            });

            $scope.saveDMeasurements = function () {
                //$ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addMeasureForm")[0]);
                callAjax("POST", domain + "doctrsrecords/save-measurements", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (response.err == '') {
                        alert("Measurements saved successfully!");
                        $rootScope.measure = 'yes';
                        $rootScope.measurement = response.records;
                        console.log('remove slide');
                        jQuery('.ciframecontainer').removeClass('active');
                        //$state.go('app.consultations-note', {'appId': $scope.appId}, {reload: true});
                    } else if (response.err != '') {
                        alert('Please fill mandatory fields');
                    }
                });
            };
        })

        .controller('ObservationCtrl', function ($scope, $http, $stateParams, $state, $rootScope, $ionicModal, $timeout, $filter, $cordovaCamera, $ionicLoading) {
            $scope.objId = $stateParams.objid;
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.objText = [];
            $scope.selConditions = [];
            $scope.observation = '';
            $scope.cnId = '';
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-observations-lang',
                params: {userId: $scope.userId, interface: $scope.interface, objId: $stateParams.objid}
            }).then(function successCallback(response) {
                if (response.data.recdata != '') {
                    $scope.objText = response.data.recdata.metadata_values;
                    $rootScope.objText = $scope.objText;
                }
            }, function errorCallback(e) {
                console.log(e);
            });
            $ionicModal.fromTemplateUrl('addeval', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.showM = function () {
                    $scope.observation = {value: ''};
                    $scope.modal.show();
                };
            });
            $scope.submitmodal = function (observation) {
                alert(observation);
                $scope.objText.push({value: observation});
                $rootScope.objText = $scope.objText;
                $scope.observation = {value: ''};
                $scope.modal.hide();
            };
            $rootScope.$on("SaveObjservation", function (pid) {
                $scope.saveObj(pid);
            });
            $scope.saveObj = function (pid) {
                console.log(pid);
                if ($rootScope.patientId) {
                    $scope.patientId = $rootScope.patientId;
                } else {
                    $scope.patientId = get('patientId');
                    $scope.doctorId = get('doctorId');
                }
                $scope.cnId = $rootScope.recCId;
                console.log($scope.objText);
                $scope.patientId = window.localStorage.getItem('patientId');
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/save-observations',
                    params: {patient: $scope.patientId, cnId: $scope.cnId, userId: $scope.userId, objType: 'Text', doctor: $scope.doctorId, catId: $scope.catId, objText: JSON.stringify($scope.objText), objId: $stateParams.objid}
                }).then(function successCallback(response) {
                    if (angular.isObject(response.data.records)) {
                        $rootScope.objId = response.data.records.id;
                        //alert("Observations added succesesfully!");
                        //$state.go('app.notetype');
                        //$state.go('app.consultations-note', {'appId': $scope.appId}, {reload: true});
                    }
                }, function errorCallback(e) {
                    console.log(e);
                });
            };
            $scope.saveDObj = function () {
                console.log($scope.objText);
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/save-observations',
                    params: {patient: $scope.patientId, userId: $scope.userId, objType: 'Text', doctor: $scope.doctorId, catId: $scope.catId, objText: JSON.stringify($scope.objText), objId: $stateParams.objid}
                }).then(function successCallback(response) {
                    if (angular.isObject(response.data.records)) {
                        $rootScope.objId = response.data.records.id;
                        //alert("Observations added succesesfully!");
                        console.log('remove slide');
                        jQuery('.ciframecontainer').removeClass('active');
                        //$state.go('app.consultations-note', {'appId': $scope.appId}, {reload: true});
                    }
                }, function errorCallback(e) {
                    console.log(e);
                });
            };
        })

        .controller('PlaintestCtrl', function ($scope, $ionicModal, $rootScope) {
            $ionicModal.fromTemplateUrl('editVal', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.showEM = function (ind) {
                    console.log("khkh" + ind);
                    $scope.ind = ind;
                    $scope.observation = $rootScope.objText[ind].value;
                    $scope.modal.show();
                };
            });
            $scope.submitmodal = function (observation) {
                $rootScope.objText[$scope.ind].value = observation;
                console.log($rootScope.objText);
                $scope.modal.hide();
            };
        })

        .controller('TestResultCtrl', function ($scope, $http, $stateParams, $state, $rootScope, $ionicModal, $timeout, $filter, $cordovaCamera, $ionicLoading) {
            $scope.testid = $stateParams.testid;
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.testText = [];
            $scope.testresult = {};
            $scope.cnId = '';
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-testresult-lang',
                params: {userId: $scope.userId, interface: $scope.interface, objId: $stateParams.testid}
            }).then(function successCallback(response) {
                if (response.data.recdata != '') {
                    $scope.testText = response.data.recdata.metadata_values;
                    $rootScope.testText = $scope.testText;
                }
            }, function errorCallback(e) {
                console.log(e);
            });
            $ionicModal.fromTemplateUrl('addTestresult', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.showM = function () {
                    $scope.testresult = {value: ''};
                    $scope.modal.show();
                };
            });
            $scope.submitmodal = function (testresult) {
                alert(testresult);
                $scope.testText.push({value: testresult});
                $rootScope.testText = $scope.testText;
                console.log($scope.testText);
                $scope.testresult = {value: ''};
                $scope.modal.hide();
            };
            $rootScope.$on("SaveTestResult", function (pid) {
                $scope.saveTestresult(pid);
            });
            $scope.saveTestresult = function (pid) {
                console.log(pid);
                console.log($scope.testText);
                if ($rootScope.patientId) {
                    $scope.patientId = $rootScope.patientId;
                } else {
                    $scope.patientId = get('patientId');
                    $scope.doctorId = get('doctorId');
                }
                $scope.cnId = $rootScope.recCId;
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/save-testresults',
                    params: {patient: $scope.patientId, cnId: $scope.cnId, userId: $scope.userId, objType: 'Text', doctor: $scope.doctorId, catId: $scope.catId, objText: JSON.stringify($scope.objText), objId: $stateParams.testid}
                }).then(function successCallback(response) {
                    if (angular.isObject(response.data.records)) {
                        $rootScope.testId = response.data.records.id;
                        //alert("Test Results added succesesfully!");
                        //$state.go('app.notetype');
                        //$state.go('app.consultations-note', {'appId': $scope.appId}, {reload: true});
                    }
                }, function errorCallback(e) {
                    console.log(e);
                });
            };
            $scope.saveDTestresult = function () {
                console.log($scope.testText);
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/save-testresults',
                    params: {patient: $scope.patientId, userId: $scope.userId, objType: 'Text', doctor: $scope.doctorId, catId: $scope.catId, objText: JSON.stringify($scope.objText), objId: $stateParams.objid}
                }).then(function successCallback(response) {
                    if (angular.isObject(response.data.records)) {
                        $rootScope.testId = response.data.records.id;
                        //alert("Test Results added succesesfully!");
                        console.log('remove slide');
                        jQuery('.ciframecontainer').removeClass('active');
                        //$state.go('app.consultations-note', {'appId': $scope.appId}, {reload: true});
                    }
                }, function errorCallback(e) {
                    console.log(e);
                });
            };
        })

        .controller('PlaintestResultCtrl', function ($scope, $ionicModal, $rootScope) {
            $ionicModal.fromTemplateUrl('editTest', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.showEM = function (ind) {
                    console.log("khkh" + ind);
                    $scope.ind = ind;
                    $scope.testresult = $rootScope.testText[ind].value;
                    $scope.modal.show();
                };
            });
            $scope.submitmodal = function (testresult) {
                $rootScope.testText[$scope.ind].value = testresult;
                console.log($rootScope.testText);
                $scope.modal.hide();
            };
        })

        .controller('DiagnosisTextCtrl', function ($scope, $ionicModal, $rootScope, $http, $state, $stateParams) {
            $scope.diaId = $stateParams.diaid;
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.diaText = {};
            $scope.diaText.value = '';
            $scope.cnId = '';
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-diagnosis-lang',
                params: {userId: $scope.userId, diaId: $scope.diaId}
            }).then(function successCallback(response) {
                if (response.data.recdata != '') {
                    $scope.diaText.value = response.data.recdata.value;
                }
            }, function errorCallback(e) {
                console.log(e);
            });
            $rootScope.$on("SaveDigno", function (pid) {
                $scope.saveDiagnosis(pid);
            });
            $scope.saveDiagnosis = function (pid) {
                console.log(pid);
                if ($rootScope.patientId) {
                    $scope.patientId = $rootScope.patientId;
                } else {
                    $scope.patientId = get('patientId');
                    $scope.doctorId = get('doctorId');
                }
                $scope.cnId = $rootScope.recCId;
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/save-diagnosis',
                    params: {patient: $scope.patientId, cnId: $scope.cnId, userId: $scope.userId, diaType: 'Text', doctor: $scope.doctorId, catId: $scope.catId, diaText: $scope.diaText.value, diaId: $scope.diaId}
                }).then(function successCallback(response) {
                    if (angular.isObject(response.data.records)) {
                        console.log(response.data.records.id);
                        $rootScope.diaId = response.data.records.id;
                        //alert("Diagnosis added succesesfully!");
                        //$scope.modal.hide();
                        //$state.go('app.notetype');
                        //$state.go('app.consultations-note', {'appId': $scope.appId}, {reload: true});
                    }
                }, function errorCallback(e) {
                    console.log(e);
                });
            };
            $scope.saveDDiagnosis = function (data) {
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/save-diagnosis',
                    params: {patient: $scope.patientId, userId: $scope.userId, diaType: 'Text', doctor: $scope.doctorId, catId: $scope.catId, diaText: $scope.diaText.value, diaId: $scope.diaId}
                }).then(function successCallback(response) {
                    if (angular.isObject(response.data.records)) {
                        console.log(response.data.records.id);
                        $rootScope.diaId = response.data.records.id;
                        //alert("Diagnosis added succesesfully!");
                        console.log('remove slide');
                        jQuery('.ciframecontainer').removeClass('active');
                        //$state.go('app.consultations-note', {'appId': $scope.appId}, {reload: true});
                    }
                }, function errorCallback(e) {
                    console.log(e);
                });
            };
        })

        .controller('InvestigationsCtrl', function ($scope, $http, $stateParams, $ionicModal, $rootScope, $filter, $ionicLoading) {
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.catId = 'Investigations';
            $scope.curTime = new Date();
            $scope.curTimeo = $filter('date')(new Date(), 'hh:mm');
            $scope.investigation = [];
            $scope.invData = [];
            $scope.inv = [];
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-investigation-fields',
                params: {patient: $scope.patientId, userId: $scope.userId, doctor: $scope.doctorId, catId: $scope.catId, mid: $stateParams.mid}
            }).then(function successCallback(response) {
                console.log(response);
                $scope.records = response.data.record;
                $scope.fields = response.data.fields;
                $scope.category = $scope.records.id;
                $scope.problems = response.data.problems;
                $scope.doctrs = response.data.doctrs;
            }, function errorCallback(response) {
                console.log(response);
            });
            $scope.chkDt = function (dt) {
                console.log(dt);
                console.log($scope.curTime);
                console.log($scope.curTime < dt);
                if (!($scope.curTime < dt)) {
                    alert('End date should be greater than start date.');
                    jQuery('#enddt').val('');
                }
            };
            $scope.addOther = function (name, field, val) {
                addOther(name, field, val);
            };
            $scope.check = function (val) {
                console.log(val);
                if ($scope.category == 7) {
                    if (val) {
                        jQuery('#billStatus').val('Paid');
                        jQuery('#billmode').removeClass('hide');
                    } else {
                        jQuery('#billStatus').val('Unpaid');
                        jQuery('#billmode').addClass('hide');
                    }
                }
                if ($scope.category == 2) {
                    if (val) {
                        jQuery('#immrcvdate').val('Received');
                        jQuery('#imdtrcv').removeClass('hide');
                        jQuery('.imd').removeClass('hide');
                    } else {
                        jQuery('#immrcvdate').val('To be received');
                        jQuery('#imdtrcv').addClass('hide');
                        jQuery('.imd').addClass('hide');
                    }
                }
                if ($scope.category == 4) {
                    if (val) {
                        jQuery('#proconduct').val('Conducted On');
                        jQuery('#proconon').removeClass('hide');
                        jQuery('#proconbef').addClass('hide');
                    } else {
                        jQuery('#proconduct').val('To be conducted');
                        jQuery('#proconon').addClass('hide');
                        jQuery('#proconbef').removeClass('hide');
                    }
                }
                if ($scope.category == 5) {
                    if (val) {
                        jQuery('#invconduct').val('Conducted On');
                        jQuery('#invconon').removeClass('hide');
                        jQuery('.inv').removeClass('hide');
                        jQuery('#invconbef').addClass('hide');
                    } else {
                        jQuery('#invconduct').val('To be conducted');
                        jQuery('#invconon').addClass('hide');
                        jQuery('.inv').addClass('hide');
                        jQuery('#invconbef').removeClass('hide');
                    }
                }
            };
            $scope.rcheck = function (val) {
                console.log(val);
                if ($scope.categoryId == 2) {
                    if (val) {
                        jQuery('#imrpton').removeClass('hide');
                        jQuery('.imd').removeClass('hide');
                    } else {
                        jQuery('#imrpton').addClass('hide');
                        jQuery('.imd').addClass('hide');
                    }
                }
            };
            $ionicModal.fromTemplateUrl('add-treatmentplan', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
            $scope.saveInvestigation = function () {
                console.log("From Investigations");
                var data = new FormData(jQuery("#addInvForm")[0]);
                console.log(data);
                //$ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addInvForm")[0]);
                callAjax("POST", domain + "doctrsrecords/save-treatment-plan", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (response.records != '') {
                        alert("Investigation saved successfully!");
                        $scope.investigation.push(response.records);
                        $scope.invData.push(response.recordsData);
                        $scope.inv.push(response.records.id);
                        console.log($scope.investigation);
                        console.log($scope.invData);
                        $rootScope.inv = $scope.inv;
                        //$rootScope.measure = 'yes';
                        //$rootScope.measurement = response.records;
                    } else if (response.err != '') {
                        alert('Please fill mandatory fields');
                    }
                });
            };
        })

        .controller('MedicationsCtrl', function ($scope, $http, $stateParams, $ionicModal, $rootScope, $filter, $ionicLoading) {
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.catId = 'Medications';
            $scope.curTime = new Date();
            $scope.curTimeo = $filter('date')(new Date(), 'hh:mm');
            $scope.medication = [];
            $scope.mediData = [];
            $scope.medi = [];
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-investigation-fields',
                params: {patient: $scope.patientId, userId: $scope.userId, doctor: $scope.doctorId, catId: $scope.catId, mid: $stateParams.mid}
            }).then(function successCallback(response) {
                console.log(response);
                $scope.records = response.data.record;
                $scope.fields = response.data.fields;
                $scope.category = $scope.records.id;
                $scope.problems = response.data.problems;
                $scope.doctrs = response.data.doctrs;
            }, function errorCallback(response) {
                console.log(response);
            });
            $scope.chkDt = function (dt) {
                console.log(dt);
                console.log($scope.curTime);
                console.log($scope.curTime < dt);
                if (!($scope.curTime < dt)) {
                    alert('End date should be greater than start date.');
                    jQuery('#enddt').val('');
                }
            };
            $scope.addOther = function (name, field, val) {
                addOther(name, field, val);
            };
            $scope.check = function (val) {
                console.log(val);
                if ($scope.category == 7) {
                    if (val) {
                        jQuery('#billStatus').val('Paid');
                        jQuery('#billmode').removeClass('hide');
                    } else {
                        jQuery('#billStatus').val('Unpaid');
                        jQuery('#billmode').addClass('hide');
                    }
                }
                if ($scope.category == 2) {
                    if (val) {
                        jQuery('#immrcvdate').val('Received');
                        jQuery('#imdtrcv').removeClass('hide');
                        jQuery('.imd').removeClass('hide');
                    } else {
                        jQuery('#immrcvdate').val('To be received');
                        jQuery('#imdtrcv').addClass('hide');
                        jQuery('.imd').addClass('hide');
                    }
                }
                if ($scope.category == 4) {
                    if (val) {
                        jQuery('#proconduct').val('Conducted On');
                        jQuery('#proconon').removeClass('hide');
                        jQuery('#proconbef').addClass('hide');
                    } else {
                        jQuery('#proconduct').val('To be conducted');
                        jQuery('#proconon').addClass('hide');
                        jQuery('#proconbef').removeClass('hide');
                    }
                }
                if ($scope.category == 5) {
                    if (val) {
                        jQuery('#invconduct').val('Conducted On');
                        jQuery('#invconon').removeClass('hide');
                        jQuery('.inv').removeClass('hide');
                        jQuery('#invconbef').addClass('hide');
                    } else {
                        jQuery('#invconduct').val('To be conducted');
                        jQuery('#invconon').addClass('hide');
                        jQuery('.inv').addClass('hide');
                        jQuery('#invconbef').removeClass('hide');
                    }
                }
            };
            $scope.rcheck = function (val) {
                console.log(val);
                if ($scope.categoryId == 2) {
                    if (val) {
                        jQuery('#imrpton').removeClass('hide');
                        jQuery('.imd').removeClass('hide');
                    } else {
                        jQuery('#imrpton').addClass('hide');
                        jQuery('.imd').addClass('hide');
                    }
                }
            };
            $scope.saveMedication = function () {
                console.log("From Medication");
                var data = new FormData(jQuery("#addMedicationForm")[0]);
                console.log(data);
                //$ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addMedicationForm")[0]);
                callAjax("POST", domain + "doctrsrecords/save-treatment-plan", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (response.records != '') {
                        alert("Medication saved successfully!");
                        $scope.medication.push(response.records);
                        $scope.mediData.push(response.recordsData);
                        $scope.medi.push(response.records.id);
                        console.log($scope.medication);
                        console.log($scope.mediData);
                        $rootScope.medi = $scope.medi;
                        //$rootScope.measure = 'yes';
                        //$rootScope.measurement = response.records;
                    } else if (response.err != '') {
                        alert('Please fill mandatory fields');
                    }
                });
            };
        })

        .controller('ProceduresCtrl', function ($scope, $http, $stateParams, $ionicModal, $rootScope, $filter, $ionicLoading) {
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.catId = 'Procedures';
            $scope.curTime = new Date();
            $scope.curTimeo = $filter('date')(new Date(), 'hh:mm');
            $scope.procedure = [];
            $scope.proData = [];
            $scope.proc = [];
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-investigation-fields',
                params: {patient: $scope.patientId, userId: $scope.userId, doctor: $scope.doctorId, catId: $scope.catId, mid: $stateParams.mid}
            }).then(function successCallback(response) {
                console.log(response);
                $scope.records = response.data.record;
                $scope.fields = response.data.fields;
                $scope.category = $scope.records.id;
                $scope.problems = response.data.problems;
                $scope.doctrs = response.data.doctrs;
            }, function errorCallback(response) {
                console.log(response);
            });
            $scope.chkDt = function (dt) {
                console.log(dt);
                console.log($scope.curTime);
                console.log($scope.curTime < dt);
                if (!($scope.curTime < dt)) {
                    alert('End date should be greater than start date.');
                    jQuery('#enddt').val('');
                }
            };
            $scope.addOther = function (name, field, val) {
                addOther(name, field, val);
            };
            $scope.check = function (val) {
                console.log(val);
                if ($scope.category == 7) {
                    if (val) {
                        jQuery('#billStatus').val('Paid');
                        jQuery('#billmode').removeClass('hide');
                    } else {
                        jQuery('#billStatus').val('Unpaid');
                        jQuery('#billmode').addClass('hide');
                    }
                }
                if ($scope.category == 2) {
                    if (val) {
                        jQuery('#immrcvdate').val('Received');
                        jQuery('#imdtrcv').removeClass('hide');
                        jQuery('.imd').removeClass('hide');
                    } else {
                        jQuery('#immrcvdate').val('To be received');
                        jQuery('#imdtrcv').addClass('hide');
                        jQuery('.imd').addClass('hide');
                    }
                }
                if ($scope.category == 4) {
                    if (val) {
                        jQuery('#proconduct').val('Conducted On');
                        jQuery('#proconon').removeClass('hide');
                        jQuery('#proconbef').addClass('hide');
                    } else {
                        jQuery('#proconduct').val('To be conducted');
                        jQuery('#proconon').addClass('hide');
                        jQuery('#proconbef').removeClass('hide');
                    }
                }
                if ($scope.category == 5) {
                    if (val) {
                        jQuery('#invconduct').val('Conducted On');
                        jQuery('#invconon').removeClass('hide');
                        jQuery('.inv').removeClass('hide');
                        jQuery('#invconbef').addClass('hide');
                    } else {
                        jQuery('#invconduct').val('To be conducted');
                        jQuery('#invconon').addClass('hide');
                        jQuery('.inv').addClass('hide');
                        jQuery('#invconbef').removeClass('hide');
                    }
                }
            };
            $scope.rcheck = function (val) {
                console.log(val);
                if ($scope.categoryId == 2) {
                    if (val) {
                        jQuery('#imrpton').removeClass('hide');
                        jQuery('.imd').removeClass('hide');
                    } else {
                        jQuery('#imrpton').addClass('hide');
                        jQuery('.imd').addClass('hide');
                    }
                }
            };
            $scope.saveProcedure = function () {
                console.log("From Procedure");
                var data = new FormData(jQuery("#addProcedureForm")[0]);
                console.log(data);
                //$ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addProcedureForm")[0]);
                callAjax("POST", domain + "doctrsrecords/save-treatment-plan", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (response.records != '') {
                        alert("Procedure saved successfully!");
                        $scope.procedure.push(response.records);
                        $scope.proData.push(response.recordsData);
                        $scope.proc.push(response.records.id);
                        console.log($scope.procedure);
                        console.log($scope.proData);
                        $rootScope.proc = $scope.proc;
                        //$rootScope.measure = 'yes';
                        //$rootScope.measurement = response.records;
                    } else if (response.err != '') {
                        alert('Please fill mandatory fields');
                    }
                });
            };
        })

        .controller('LifeStyleCtrl', function ($scope, $http, $stateParams, $ionicModal, $rootScope, $filter, $ionicLoading) {
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.curTime = new Date();
            $scope.curTimeo = $filter('date')(new Date(), 'hh:mm');
            $scope.catId = 'Activity & Lifestyle';
            $scope.lifestyle = [];
            $scope.lifeData = [];
            $scope.life = [];
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-investigation-fields',
                params: {patient: $scope.patientId, userId: $scope.userId, doctor: $scope.doctorId, catId: $scope.catId, mid: $stateParams.mid}
            }).then(function successCallback(response) {
                console.log(response);
                $scope.records = response.data.record;
                $scope.fields = response.data.fields;
                $scope.category = $scope.records.id;
                $scope.problems = response.data.problems;
                $scope.doctrs = response.data.doctrs;
            }, function errorCallback(response) {
                console.log(response);
            });
            $scope.chkDt = function (dt) {
                console.log(dt);
                console.log($scope.curTime);
                console.log($scope.curTime < dt);
                if (!($scope.curTime < dt)) {
                    alert('End date should be greater than start date.');
                    jQuery('#enddt').val('');
                }
            };
            $scope.addOther = function (name, field, val) {
                addOther(name, field, val);
            };
            $scope.check = function (val) {
                console.log(val);
                if ($scope.category == 7) {
                    if (val) {
                        jQuery('#billStatus').val('Paid');
                        jQuery('#billmode').removeClass('hide');
                    } else {
                        jQuery('#billStatus').val('Unpaid');
                        jQuery('#billmode').addClass('hide');
                    }
                }
                if ($scope.category == 2) {
                    if (val) {
                        jQuery('#immrcvdate').val('Received');
                        jQuery('#imdtrcv').removeClass('hide');
                        jQuery('.imd').removeClass('hide');
                    } else {
                        jQuery('#immrcvdate').val('To be received');
                        jQuery('#imdtrcv').addClass('hide');
                        jQuery('.imd').addClass('hide');
                    }
                }
                if ($scope.category == 4) {
                    if (val) {
                        jQuery('#proconduct').val('Conducted On');
                        jQuery('#proconon').removeClass('hide');
                        jQuery('#proconbef').addClass('hide');
                    } else {
                        jQuery('#proconduct').val('To be conducted');
                        jQuery('#proconon').addClass('hide');
                        jQuery('#proconbef').removeClass('hide');
                    }
                }
                if ($scope.category == 5) {
                    if (val) {
                        jQuery('#invconduct').val('Conducted On');
                        jQuery('#invconon').removeClass('hide');
                        jQuery('.inv').removeClass('hide');
                        jQuery('#invconbef').addClass('hide');
                    } else {
                        jQuery('#invconduct').val('To be conducted');
                        jQuery('#invconon').addClass('hide');
                        jQuery('.inv').addClass('hide');
                        jQuery('#invconbef').removeClass('hide');
                    }
                }
            };
            $scope.rcheck = function (val) {
                console.log(val);
                if ($scope.categoryId == 2) {
                    if (val) {
                        jQuery('#imrpton').removeClass('hide');
                        jQuery('.imd').removeClass('hide');
                    } else {
                        jQuery('#imrpton').addClass('hide');
                        jQuery('.imd').addClass('hide');
                    }
                }
            };
            $scope.saveLifestyle = function () {
                console.log("From Lifestyle");
                var data = new FormData(jQuery("#addLifeStyleForm")[0]);
                console.log(data);
                //$ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addLifeStyleForm")[0]);
                callAjax("POST", domain + "doctrsrecords/save-treatment-plan", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (response.records != '') {
                        alert("Investigation saved successfully!");
                        $scope.lifestyle.push(response.records);
                        $scope.lifeData.push(response.recordsData);
                        $scope.life.push(response.records.id);
                        console.log($scope.lifestyle);
                        console.log($scope.lifeData);
                        $rootScope.life = $scope.life;
                        //$rootScope.measure = 'yes';
                        //$rootScope.measurement = response.records;
                    } else if (response.err != '') {
                        alert('Please fill mandatory fields');
                    }
                });
            };
        })

        .controller('ReferralCtrl', function ($scope, $http, $stateParams, $ionicModal, $rootScope, $filter, $ionicLoading) {
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.catId = 'Referral';
            $scope.curTime = new Date();
            $scope.curTimeo = $filter('date')(new Date(), 'hh:mm');
            $scope.referral = [];
            $scope.refData = []
            $scope.refer = [];
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-investigation-fields',
                params: {patient: $scope.patientId, userId: $scope.userId, doctor: $scope.doctorId, catId: $scope.catId, mid: $stateParams.mid}
            }).then(function successCallback(response) {
                console.log(response);
                $scope.records = response.data.record;
                $scope.fields = response.data.fields;
                $scope.category = $scope.records.id;
                $scope.problems = response.data.problems;
                $scope.doctrs = response.data.doctrs;
            }, function errorCallback(response) {
                console.log(response);
            });
            $scope.chkDt = function (dt) {
                console.log(dt);
                console.log($scope.curTime);
                console.log($scope.curTime < dt);
                if (!($scope.curTime < dt)) {
                    alert('End date should be greater than start date.');
                    jQuery('#enddt').val('');
                }
            };
            $scope.addOther = function (name, field, val) {
                addOther(name, field, val);
            };
            $scope.check = function (val) {
                console.log(val);
                if ($scope.category == 7) {
                    if (val) {
                        jQuery('#billStatus').val('Paid');
                        jQuery('#billmode').removeClass('hide');
                    } else {
                        jQuery('#billStatus').val('Unpaid');
                        jQuery('#billmode').addClass('hide');
                    }
                }
                if ($scope.category == 2) {
                    if (val) {
                        jQuery('#immrcvdate').val('Received');
                        jQuery('#imdtrcv').removeClass('hide');
                        jQuery('.imd').removeClass('hide');
                    } else {
                        jQuery('#immrcvdate').val('To be received');
                        jQuery('#imdtrcv').addClass('hide');
                        jQuery('.imd').addClass('hide');
                    }
                }
                if ($scope.category == 4) {
                    if (val) {
                        jQuery('#proconduct').val('Conducted On');
                        jQuery('#proconon').removeClass('hide');
                        jQuery('#proconbef').addClass('hide');
                    } else {
                        jQuery('#proconduct').val('To be conducted');
                        jQuery('#proconon').addClass('hide');
                        jQuery('#proconbef').removeClass('hide');
                    }
                }
                if ($scope.category == 5) {
                    if (val) {
                        jQuery('#invconduct').val('Conducted On');
                        jQuery('#invconon').removeClass('hide');
                        jQuery('.inv').removeClass('hide');
                        jQuery('#invconbef').addClass('hide');
                    } else {
                        jQuery('#invconduct').val('To be conducted');
                        jQuery('#invconon').addClass('hide');
                        jQuery('.inv').addClass('hide');
                        jQuery('#invconbef').removeClass('hide');
                    }
                }
            };
            $scope.rcheck = function (val) {
                console.log(val);
                if ($scope.categoryId == 2) {
                    if (val) {
                        jQuery('#imrpton').removeClass('hide');
                        jQuery('.imd').removeClass('hide');
                    } else {
                        jQuery('#imrpton').addClass('hide');
                        jQuery('.imd').addClass('hide');
                    }
                }
            };
            $scope.saveReferral = function () {
                console.log("From Referral");
                var data = new FormData(jQuery("#addReferralForm")[0]);
                console.log(data);
                //$ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addReferralForm")[0]);
                callAjax("POST", domain + "doctrsrecords/save-treatment-plan", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (response.records != '') {
                        alert("Referral saved successfully!");
                        $scope.referral.push(response.records);
                        $scope.refData.push(response.recordsData);
                        $scope.refer.push(response.records.id);
                        console.log($scope.referral);
                        console.log($scope.refData);
                        $rootScope.refer = $scope.refer;
                        //$rootScope.measure = 'yes';
                        //$rootScope.measurement = response.records;
                    } else if (response.err != '') {
                        alert('Please fill mandatory fields');
                    }
                });
            };
        })

        .controller('DietplanCtrl', function ($scope, $http, $stateParams, $ionicModal, $rootScope, $filter) {
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.catId = 'Diet Plan';
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('doctorId'); //$stateParams.drId
            $scope.curTime = new Date();
            $scope.curTimeo = $filter('date')(new Date(), 'hh:mm a');
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-about-fields',
                params: {patient: $scope.patientId, userId: $scope.userId, doctorId: $scope.doctorId, catId: $scope.catId}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.record = response.data.record;
                $scope.fields = response.data.fields;
                $scope.problems = response.data.problems;
                $scope.doctrs = response.data.doctrs;
                $scope.patients = response.data.patients;
                $scope.cases = response.data.cases;
            }, function errorCallback(response) {
                console.log(response);
            });
        })

        .controller('DietplanListCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $ionicModal.fromTemplateUrl('add-diet', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };

        })
        //View Note
        .controller('ViewConsultationsNoteCtrl', function ($scope, $http, $stateParams, $rootScope, $state, $sce, $ionicModal, $timeout, $filter, $cordovaCamera, $ionicLoading) {
            $scope.noteId = $stateParams.id;
            $scope.userId = window.localStorage.getItem('id');
            $scope.record = {};
            $scope.recordDetails = {};
            $scope.problems = {};
            $scope.doctrs = {};
            $scope.patients = {};
            $scope.cases = {};
            $scope.isAttachment = '';
            $scope.measurements = {value: 'no'};
            $scope.obj = {value: 'no'};
            $scope.testResult = {value: 'no'};
            $scope.diagnosis = {value: 'no'};
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-note-details',
                params: {noteId: $scope.noteId, userId: $scope.userId, interface: $scope.interface}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.record = response.data.record;
                $scope.recordDetails = response.data.recordsDetails;
                $scope.problems = response.data.problem;
                $scope.doctrs = response.data.doctrs;
                $scope.patients = response.data.patient;
                $scope.cases = response.data.caseData;
                $scope.otherRecords = response.data.otherRecords;
                angular.forEach($scope.otherRecords, function (val, key) {
                    if (val.category == '12' || val.category == '13' || val.category == '16') {
                        $scope.measurements = {value: 'yes'};
                    } else if (val.category == '27') {
                        $scope.obj = {value: 'yes'};
                    } else if (val.category == '29') {
                        $scope.testResult = {value: 'yes'};
                    } else if (val.category == '28') {
                        $scope.diagnosis = {value: 'yes'};
                    }
                });
                angular.forEach($scope.recordDetails, function (val, key) {
                    if (val.fields.field == 'Attachments') {
                        $scope.isAttachment = val.attachments.length;
                    }
                });
                console.log($scope.recordDetails);
            }, function errorCallback(response) {
                console.log(response);
            });
            $scope.path = "";
            $scope.name = "";
            $ionicModal.fromTemplateUrl('filesview.html', function ($ionicModal) {
                $scope.modal = $ionicModal;
                $scope.showm = function (path, name) {
                    $scope.path = path;
                    $scope.name = name;
                    console.log(path + '=afd =' + name);
                    $scope.value = $rootScope.attachpath + path + name;
                    $scope.modal.show();
                }

            }, {
                // Use our scope for the scope of the modal to keep it simple
                scope: $scope,
                // The animation we want to use for the modal entrance
                animation: 'slide-in-up'
            });
            $scope.trustSrc = function (src) {
                return $sce.trustAsResourceUrl(src);
            };
            $scope.submitmodal = function () {
                console.log($scope.catIds);
                $scope.modal.hide();
            };

            $scope.print = function () {
                //  console.log("fsfdfsfd");
                //  var printerAvail = $cordovaPrinter.isAvailable();
                var print_page = '<img src="' + $rootScope.attachpath + $scope.path + $scope.name + '"  height="600" width="300" />';
                //console.log(print_page);  
                cordova.plugins.printer.print(print_page, 'Print', function () {
                    alert('printing finished or canceled');
                });
            };
            $scope.getMeasureDetails = function (id, type) {
                console.log(id + "===" + type);
                if (type == 'measurements') {
                    $state.go('app.view-measure-details', {id: id, type: type}, {reload: true});
                } else {
                    $state.go('app.view-cn-details', {id: id, type: type}, {reload: true});
                }
            };
            $scope.getCnDetails = function (id, type) {
                console.log(id + "===" + type);
                $state.go('app.view-cn-details', {id: id, type: type}, {reload: true});
            };
        })

        .controller('MeasureDetailsCtrl', function ($scope, $http, $state, $sce, $rootScope, $stateParams) {
            $scope.cnId = $stateParams.id;
            $scope.type = $stateParams.type;
            $scope.userId = get('id');
            $scope.doctrId = get('id');
            console.log($scope.cnId + '==' + $scope.type);
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-measure-details',
                params: {noteId: $scope.cnId, userId: $scope.userId, interface: $scope.interface, type: $scope.type}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.records = response.data.records;
                $scope.recordDetails = response.data.recordsDetails;
                $scope.problems = response.data.problem;
                $scope.doctrs = response.data.doctrs;
                $scope.patients = response.data.patient;
                $scope.cases = response.data.caseData;
                angular.forEach($scope.recordDetails, function (val, key) {
                    if (val.fields.field == 'Attachments') {
                        $scope.isAttachment = val.attachments.length;
                    }
                });
                console.log($scope.recordDetails);
            }, function errorCallback(response) {
                console.log(response);
            });
        })

        .controller('OtherDetailsCtrl', function ($scope, $http, $state, $sce, $rootScope, $stateParams) {
            $scope.cnId = $stateParams.id;
            $scope.type = $stateParams.type;
            $scope.userId = get('id');
            $scope.doctrId = get('id');
            console.log($scope.cnId + '==' + $scope.type);
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-cn-details',
                params: {noteId: $scope.cnId, userId: $scope.userId, interface: $scope.interface, type: $scope.type}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.record = response.data.records;
                $scope.recordDetails = response.data.recordsDetails;
                $scope.problems = response.data.problem;
                $scope.doctrs = response.data.doctrs;
                $scope.patients = response.data.patient;
                $scope.cases = response.data.caseData;
                angular.forEach($scope.recordDetails, function (val, key) {
                    if (val.fields.field == 'Attachments') {
                        $scope.isAttachment = val.attachments.length;
                    }
                });
                console.log($scope.recordDetails);
            }, function errorCallback(response) {
                console.log(response);
            });
        })

        .controller('ViewPatientHistoryCtrl', function ($scope, $http, $stateParams, $rootScope, $state, $sce, $ionicModal, $timeout, $filter, $cordovaCamera, $ionicLoading) {
            $scope.patientId = $stateParams.id; //window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.catId = 'Patient History';
            $scope.conId = [];
            $scope.conIds = [];
            $scope.selConditions = [];
            $scope.gend = '';
            $scope.gender = '';
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id'); //$stateParams.drId
            $scope.curTime = new Date();
            $scope.curTimeo = $filter('date')(new Date(), 'hh:mm a');
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-about-fields',
                params: {patient: $scope.patientId, userId: $scope.userId, doctorId: $scope.doctorId, catId: $scope.catId}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.record = response.data.record;
                $scope.fields = response.data.fields;
                $scope.problems = response.data.problems;
                $scope.doctrs = response.data.doctrs;
                $scope.patients = response.data.patients;
                $scope.cases = response.data.cases;
                $scope.abt = response.data.abt;
                //$scope.dob = $filter('date')(response.data.dob, 'MM dd yyyy');
                if ($scope.abt.length > 0) {
                    angular.forEach($scope.abt, function (val, key) {
                        console.log(val.fields.field + "==" + val.value);
                        var field = val.fields.field;
                        if (field.toString() == 'Gender') {
                            console.log(field);
                            $scope.gender = val.value;
                            console.log(val.value);
                            if (val.value == 1) {
                                $scope.gender = 'Male';
                            } else if (val.value == 2) {
                                $scope.gender = 'Female';
                            } else
                                $scope.gender = 'Na';
                        }
                    });
                } else {
                    if (response.data.patients[0].gender == 1) {
                        $scope.gender = 'Male';
                    } else if (response.data.patients[0].gender == 2) {
                        $scope.gender = 'Female';
                    } else
                        $scope.gender = 'Na';
                }
                console.log($scope.gender);
                $scope.selCondition = response.data.knConditions;
                if ($scope.selCondition.length > 0) {
                    angular.forEach($scope.selCondition, function (val, key) {
                        $scope.conIds.push(val.id);
                        $scope.selConditions.push({'condition': val.condition});
                    });
                }
                $scope.conditions = response.data.conditions;
                console.log($scope.conIds);
            }, function errorCallback(response) {
                console.log(response);
            });
            $ionicModal.fromTemplateUrl('filesview.html', function ($ionicModal) {
                $scope.modal = $ionicModal;
                $scope.showm = function (path, name) {
                    console.log(path + '=afd =' + name);
                    $scope.value = $rootScope.attachpath + path + name;
                    $scope.modal.show();
                }

            }, {
                // Use our scope for the scope of the modal to keep it simple  
                scope: $scope,
                // The animation we want to use for the modal entrance
                animation: 'slide-in-up'
            });
            $scope.trustSrc = function (src) {
                return $sce.trustAsResourceUrl(src);
            };
        })

        //Doctor Consultations
        .controller('DoctorConsultationsCtrl', function ($scope, $http, $stateParams, $filter, $ionicPopup, $timeout, $ionicHistory, $filter, $state) {
            $scope.drId = get('id');
            $scope.userId = get('id');
            $scope.curTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $http({
                method: 'GET',
                url: domain + 'appointment/get-patient-details',
                params: {id: $scope.drId}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.todays_app = response.data.todays_appointments;
                $scope.todays_usersData = response.data.todays_usersData;
                $scope.todays_products = response.data.todays_products;
                $scope.todays_time = response.data.todays_time;
                $scope.todays_end_time = response.data.todays_end_time;
                $scope.todays_note = response.data.todays_note;
                $scope.todays_medicine = response.data.todays_medicine;
                //past section
                $scope.todays_app_past = response.data.todays_appointments_past;
                $scope.todays_usersData_past = response.data.todays_usersData_past;
                $scope.todays_products_past = response.data.todays_products_past;
                $scope.todays_time_past = response.data.todays_time_past;
                $scope.todays_end_time_past = response.data.todays_end_time_past;
                $scope.todays_note_past = response.data.todays_note_past;
                $scope.todays_medicine_past = response.data.todays_medicine_past;
                // end past section //
                $scope.week_app = response.data.week_appointments;
                $scope.week_usersData = response.data.week_usersData;
                $scope.week_products = response.data.week_products;
                $scope.week_time = response.data.week_time;
                $scope.week_end_time = response.data.week_end_time;
                $scope.week_note = response.data.week_note;
                $scope.week_medicine = response.data.week_medicine;
                //past section 
                $scope.week_app_past = response.data.week_appointments_past;
                $scope.week_usersData_past = response.data.week_usersData_past;
                $scope.week_products_past = response.data.week_products_past;
                $scope.week_time_past = response.data.week_time_past;
                $scope.week_end_time_past = response.data.week_end_time_past;
                $scope.week_note_past = response.data.week_note_past;
                $scope.week_medicine_past = response.data.week_medicine_past;
                //end past section
                $scope.all_app = response.data.all_appointments;
                $scope.all_usersData = response.data.all_usersData;
                $scope.all_products = response.data.all_products;
                $scope.all_time = response.data.all_time;
                $scope.all_end_time = response.data.all_end_time;
                $scope.all_note = response.data.all_note;
                $scope.all_medicine = response.data.all_medicine;
                //past section //
                $scope.all_app_past = response.data.all_appointments_past;
                $scope.all_usersData_past = response.data.all_usersData_past;
                $scope.all_products_past = response.data.all_products_past;
                $scope.all_time_past = response.data.all_time_past;
                $scope.all_end_time_past = response.data.all_end_time_past;
                $scope.all_note_past = response.data.all_note_past;
                $scope.all_medicine_past = response.data.all_medicine_past;
                //end past section//
            }, function errorCallback(e) {
                console.log(e);
            });
            //Go to consultation add page
            $scope.addCnote = function (appId, from) {
                //alert(appId);
                store({'appId': appId});
                if (from == 'act')
                    store({'from': 'app.doctor-consultations'});
                else if (from == 'past')
                    store({'from': 'app.consultation-past'});
                $state.go("app.cnote", {'appId': appId}, {reload: true});
            };
            //Go to consultation view page
            $scope.viewNote = function (noteId) {
                //alert(appId);
                store({'noteId': noteId});
                $state.go("app.view-note", {'id': noteId}, {reload: true});
            };

            $scope.viewMedicine = function (consultationId) {
                //alert(noteId);
                // store({'noteId': noteId});
                $state.go("app.view-medicine", {'id': consultationId}, {reload: true});
            };
        })

        .controller('DoctorConsultationsActiveCtrl', function ($scope, $http, $stateParams, $filter, $ionicPopup, $timeout, $ionicHistory, $filter, $state, $ionicFilterBar) {
            $scope.doRefresh = function () {
                $scope.$broadcast('scroll.refreshComplete');
            };
            $scope.drId = get('id');
            $scope.userId = get('id');
            $scope.curTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $http({
                method: 'GET',
                url: domain + 'appointment/get-patient-active-details',
                params: {id: $scope.drId}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.todays_data = response.data.todays_data;
                $scope.todays_app = response.data.todays_appointments;
                $scope.todays_usersData = response.data.todays_usersData;
                $scope.todays_products = response.data.todays_products;
                $scope.todays_time = response.data.todays_time;
                $scope.todays_end_time = response.data.todays_end_time;
                $scope.todays_note = response.data.todays_note;
                $scope.todays_medicine = response.data.todays_medicine;

                $scope.week_data = response.data.week_data;
                $scope.week_app = response.data.week_appointments;
                $scope.week_usersData = response.data.week_usersData;
                $scope.week_products = response.data.week_products;
                $scope.week_time = response.data.week_time;
                $scope.week_end_time = response.data.week_end_time;
                $scope.week_note = response.data.week_note;
                $scope.week_medicine = response.data.week_medicine;

                $scope.all_data = response.data.all_data;
                $scope.all_app = response.data.all_appointments;
                $scope.all_usersData = response.data.all_usersData;
                $scope.all_products = response.data.all_products;
                $scope.all_time = response.data.all_time;
                $scope.all_end_time = response.data.all_end_time;
                $scope.all_note = response.data.all_note;
                $scope.all_medicine = response.data.all_medicine;

                $scope.timeLimit = response.data.timelimit.cancellation_time;
            }, function errorCallback(e) {
                console.log(e);
            });
            /* search plugin */
            var filterBarInstance;
            $scope.showFilterBar = function () {
                filterBarInstance = $ionicFilterBar.show({
                    items: $scope.items,
                    update: function (filteredItems, filterText) {
                        $scope.items = filteredItems;
                        if (filterText) {
                            //console.log(filterText);
                            $scope.filterall = filterText
                        } else {
                            $scope.filterall = '';
                        }
                    }
                });
            };
            $scope.refreshItems = function () {
                if (filterBarInstance) {
                    filterBarInstance();
                    filterBarInstance = null;
                }

                $timeout(function () {
                    //getItems();
                    $scope.$broadcast('scroll.refreshComplete');
                }, 1000);
            };
            /* end of search plugin */

            $scope.approveAppointment = function (appId, prodId, mode, startTime, endTime) {
                $http({
                    method: 'GET',
                    url: domain + 'doctorsapp/dr-approve-app',
                    params: {appId: appId, prodId: prodId, userId: $scope.userId}
                }).then(function successCallback(response) {
                    console.log(response.data);
                    if (response.data.update_status == 'success') {
                        alert('Your appointment is approved successfully.');
                        $state.go('app.doctor-consultations', {}, {reload: true});
                    } else if (response.data.update_status == 'fail') {
                        alert('Sorry, appointment can not booked at supersaas. Please reject it.');
                    }
                    //$state.go('app.doctor-consultations', {}, {reload: true});
                }, function errorCallback(response) {
                    console.log(response);
                });
            };
            $scope.rejectAppointment = function (appId, prodId, mode, startTime, endTime) {
                $http({
                    method: 'GET',
                    url: domain + 'doctorsapp/dr-reject-app',
                    params: {appId: appId, prodId: prodId, userId: $scope.userId}
                }).then(function successCallback(response) {
                    console.log(response.data);
                    if (response.data == 1) {
                        alert('Your appointment is rejected successfully.');
                        $state.go('app.doctor-consultations', {}, {reload: true});
                    }
                    //$state.go('app.doctor-consultations', {}, {reload: true});
                }, function errorCallback(response) {
                    console.log(response);
                });
            };
            $scope.cancelAppointment = function (appId, drId, mode, startTime) {
                $scope.appId = appId;
                $scope.userId = get('id');
                $scope.cancel = '';
                console.log(startTime);
                var curtime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                console.log(curtime);
                var timeDiff = getTimeDiff(startTime, curtime);
                console.log(timeDiff + " Time limit==" + $scope.timeLimit);
                if (timeDiff < $scope.timeLimit) {
                    if (mode == 1) {
                        alert("Appointment can not be cancelled now!");
                    }
                } else {
                    if (mode == 1) {
                        alert("Video cancel");
                        $http({
                            method: 'GET',
                            url: domain + 'appointment/dr-cancel-app',
                            params: {appId: $scope.appId, prodId: $scope.prodid, userId: $scope.userId, cancel: ''}
                        }).then(function successCallback(response) {
                            console.log(response.data);
                            if (response.data == 'success') {
                                alert('Your appointment is cancelled successfully.');
                                $state.go('app.doctor-consultations', {}, {reload: true});
                            } else {
                                alert('Sorry your appointment is not cancelled.');
                            }
                            $state.go('app.consultations-list', {}, {reload: true});
                        }, function errorCallback(response) {
                            console.log(response);
                        });
                    }
                }
            };
            $scope.joinVideo = function (mode, start, end, appId) {
                console.log(mode + "===" + start + '===' + end + "===" + $scope.curTime + "==" + appId);
                if ($scope.curTime >= start || $scope.curTime <= end) {
                    console.log('redirect');
                    //$state.go('app.patient-join', {}, {reload: true});
                    $state.go('app.doctor-join', {'id': appId, 'mode': mode});
                } else {
                    alert("You can join video before 15 minutes.");
                }
            };
            //Go to consultation add page
            $scope.addCnote = function (appId, from) {
                //alert(appId);
                store({'appId': appId});
                if (from == 'act')
                    store({'from': 'app.doctor-consultations'});
                else if (from == 'past')
                    store({'from': 'app.consultation-past'});
                $state.go("app.cnote", {'appId': appId}, {reload: true});
            };
            //Go to consultation view page
            $scope.viewNote = function (noteId) {
                //alert(appId);
                store({'noteId': noteId});
                $state.go("app.view-note", {'id': noteId}, {reload: true});
            };

            $scope.viewMedicine = function (consultationId) {
                //alert(noteId);
                // store({'noteId': noteId});
                $state.go("app.view-medicine", {'id': consultationId}, {reload: true});
            };
        })

        .controller('DoctorConsultationsPastCtrl', function ($scope, $http, $stateParams, $filter, $ionicPopup, $timeout, $ionicHistory, $filter, $state, $ionicFilterBar) {
            $scope.drId = get('id');
            $scope.userId = get('id');
            $scope.curTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $http({
                method: 'GET',
                url: domain + 'appointment/get-patient-past-details',
                params: {id: $scope.drId}
            }).then(function successCallback(response) {
                console.log(response.data);

                //past section
                $scope.todays_app_past = response.data.todays_appointments_past;
                $scope.todays_usersData_past = response.data.todays_usersData_past;
                $scope.todays_products_past = response.data.todays_products_past;
                $scope.todays_time_past = response.data.todays_time_past;
                $scope.todays_end_time_past = response.data.todays_end_time_past;
                $scope.todays_note_past = response.data.todays_note_past;
                $scope.todays_medicine_past = response.data.todays_medicine_past;
                $scope.todays_past_data = response.data.todays_past_data;
                // end past section //

                //past section 
                $scope.week_app_past = response.data.week_appointments_past;
                $scope.week_usersData_past = response.data.week_usersData_past;
                $scope.week_products_past = response.data.week_products_past;
                $scope.week_time_past = response.data.week_time_past;
                $scope.week_end_time_past = response.data.week_end_time_past;
                $scope.week_note_past = response.data.week_note_past;
                $scope.week_medicine_past = response.data.week_medicine_past;
                $scope.week_past_data = response.data.week_past_data;
                //end past section

                //past section //
                $scope.all_app_past = response.data.all_appointments_past;
                $scope.all_usersData_past = response.data.all_usersData_past;
                $scope.all_products_past = response.data.all_products_past;
                $scope.all_time_past = response.data.all_time_past;
                $scope.all_end_time_past = response.data.all_end_time_past;
                $scope.all_note_past = response.data.all_note_past;
                $scope.all_medicine_past = response.data.all_medicine_past;
                $scope.all_past_data = response.data.all_past_data;
                //end past section//
            }, function errorCallback(e) {
                console.log(e);
            });
            $scope.itemsDisplayall = 2
            $scope.addMoreItemall = function (done) {
                if ($scope.all_app_past.length > $scope.itemsDisplayall) {
                    console.log('all');
                    $scope.itemsDisplayall += 2; // load number of more items
                }
                $scope.$broadcast('scroll.infiniteScrollComplete')
            }
            $scope.Displaythisweek = 2
            $scope.Itemthisweek = function (done) {
                if ($scope.week_past_data.length > $scope.Displaythisweek) {
                    console.log('week');
                    $scope.Displaythisweek += 2; // load number of more items
                }
                $scope.$broadcast('scroll.infiniteScrollComplete')
            }
            /* search plugin */
            var filterBarInstance;
            $scope.showFilterBar = function () {
                filterBarInstance = $ionicFilterBar.show({
                    items: $scope.items,
                    update: function (filteredItems, filterText) {
                        $scope.items = filteredItems;
                        if (filterText) {
                            //console.log(filterText);
                            $scope.filterall = filterText
                        } else {
                            $scope.filterall = '';
                        }
                    }
                });
            };
            $scope.refreshItems = function () {
                if (filterBarInstance) {
                    filterBarInstance();
                    filterBarInstance = null;
                }

                $timeout(function () {
                    //getItems();
                    $scope.$broadcast('scroll.refreshComplete');
                }, 1000);
            };
            /* end of search plugin */
            $scope.joinVideo = function (mode, start, end, appId) {
                console.log(mode + "===" + start + '===' + end + "===" + $scope.curTime + "==" + appId);
                if ($scope.curTime >= start || $scope.curTime <= end) {
                    console.log('redirect');
                    //$state.go('app.patient-join', {}, {reload: true});
                    $state.go('app.doctor-join', {'id': appId, 'mode': mode}, {reload: true});
                } else {
                    alert("You can join video before 15 minutes.");
                }
            };
            //Go to consultation add page
            $scope.addCnote = function (appId, from) {
                //alert(appId);
                store({'appId': appId});
                if (from == 'act')
                    store({'from': 'app.doctor-consultations'});
                else if (from == 'past')
                    store({'from': 'app.consultation-past'});
                $state.go("app.cnote", {'appId': appId}, {reload: true});
            };
            //Go to consultation view page
            $scope.viewNote = function (noteId) {
                //alert(appId);
                store({'noteId': noteId});
                $state.go("app.view-note", {'id': noteId}, {reload: true});
            };
            $scope.viewMedicine = function (consultationId) {
                //alert(noteId);
                // store({'noteId': noteId});
                $state.go("app.view-medicine", {'id': consultationId}, {reload: true});
            };
        })

        .controller('ViewMedicineCtrl', function ($scope, $http, $stateParams, $rootScope, $state) {
            $scope.consultationId = $stateParams.id;
            $scope.userId = window.localStorage.getItem('id');
            $scope.interface = window.localStorage.getItem('interface_id');
            $http({
                method: 'GET',
                url: domain + 'inventory/get-medicine-details',
                params: {consultationId: $scope.consultationId, userId: $scope.userId, interface: $scope.interface}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.medicine = response.data.medicine;

            }, function errorCallback(response) {
                console.log(response);
            });
        })

        .controller('CancelDctrCtrl', function ($scope, $ionicModal, $filter, $http, $state) {
            $scope.can = {};
            $ionicModal.fromTemplateUrl('canceldctr', {
                scope: $scope
            }).then(function (modal) {
                $scope.canceldctr = modal;
            });
            $scope.closeCdctr = function () {
                $scope.canceldctr.hide();
            };
            $scope.closeCdr = function () {
                $scope.canceldctr.hide();
                $scope.canceldr.hide();
            };
            $scope.submitmodal = function () {
                console.log($scope.can.opt);
                if ($scope.can.opt != '') {
                    $http({
                        method: 'GET',
                        url: domain + 'appointment/dr-cancel-app',
                        params: {appId: $scope.appId, mode: $scope.mode, userId: $scope.userId, cancel: $scope.can.opt}
                    }).then(function successCallback(response) {
                        console.log(response.data);
                        if (response.data == 'success') {
                            alert('Your appointment is cancelled successfully.');
                        } else {
                            alert('Sorry your appointment is not cancelled.');
                        }
                        $state.go('app.doctor-consultations');
                    }, function errorCallback(response) {
                        console.log(response);
                    });
                }
                $scope.canceldctr.hide();
            };
            $ionicModal.fromTemplateUrl('canceldr', {
                scope: $scope
            }).then(function (modal) {
                $scope.canceldr = modal;
            });
            $scope.submitmodal = function () {
                console.log($scope.can.opt);
                if ($scope.can.opt != '') {
                    $http({
                        method: 'GET',
                        url: domain + 'appointment/dr-cancel-app',
                        params: {appId: $scope.appId, mode: $scope.mode, userId: $scope.userId, cancel: $scope.can.opt}
                    }).then(function successCallback(response) {
                        console.log(response.data);
                        if (response.data == 'success') {
                            alert('Your appointment is cancelled successfully.');
                            $state.go('app.doctor-consultations', {}, {reload: true});
                        } else {
                            alert('Sorry your appointment is not cancelled.');
                        }
                        $state.go('app.doctor-consultations');
                    }, function errorCallback(response) {
                        console.log(response);
                    });
                }
                $scope.canceldr.hide();
            };
            $scope.cancelApp = function (appId, drId, mode, startTime) {
                $scope.appId = appId;
                $scope.mode = mode;
                $scope.userId = get('id');
                $scope.cancel = '';
                console.log(startTime);
                var curtime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                console.log(curtime);
                var timeDiff = getTimeDiff(startTime, curtime);
                console.log(timeDiff + " Time limit==" + $scope.timeLimit);
                if (timeDiff < $scope.timeLimit) {
                    $scope.canceldctr.show();
                    /*if ($scope.can.opt!='') {
                     $http({
                     method: 'GET',
                     url: domain + 'appointment/dr-cancel-app',
                     params: {appId: $scope.appId, prodId: $scope.prodid, userId: $scope.userId, cancel:$scope.can.opt}
                     }).then(function successCallback(response) {
                     console.log(response.data);
                     if (response.data == 'success') {
                     alert('Your appointment is cancelled successfully.');
                     } else {
                     alert('Sorry your appointment is not cancelled.');
                     }
                     $state.go('app.doctor-consultations');
                     }, function errorCallback(response) {
                     console.log(response);
                     });
                     }*/
                } else {
                    $scope.canceldr.show();
                    /*if ($scope.can.opt!='') {
                     $http({
                     method: 'GET',
                     url: domain + 'appointment/dr-cancel-app',
                     params: {appId: $scope.appId, prodId: $scope.prodid, userId: $scope.userId, cancel:$scope.can.opt}
                     }).then(function successCallback(response) {
                     console.log(response.data);
                     if (response.data == 'success') {
                     alert('Your appointment is cancelled successfully.');
                     } else {
                     alert('Sorry your appointment is not cancelled.');
                     }
                     $state.go('app.doctor-consultations');
                     }, function errorCallback(response) {
                     console.log(response);
                     });
                     }*/
                }
            };
        })

        .controller('DoctorCurrentTabCtrl', function ($scope, $http, $stateParams, $filter, $ionicHistory, $state) {
            $scope.appId = $stateParams.id;
            $scope.drId = get('id');
            $scope.curTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $http({
                method: 'GET',
                url: domain + 'appointment/get-patient-app-details',
                params: {id: $scope.appId, drId: $scope.drId}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.app = response.data.app;
                $scope.user = response.data.userData;
                $scope.products = response.data.products;
                $scope.time = response.data.time;
                $scope.endTime = response.data.end_time;
                $scope.timeLimit = response.data.timelimit.cancellation_time;
            }, function errorCallback(e) {
                console.log(e);
            });
            $scope.cancelAppointment = function (appId, drId, mode, startTime) {
                $scope.appId = appId;
                $scope.userId = get('id');
                $scope.cancel = '';
                console.log(startTime);
                var curtime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                console.log(curtime);
                var timeDiff = getTimeDiff(startTime, curtime);
                console.log(timeDiff + " Time limit==" + $scope.timeLimit);
                if (timeDiff < $scope.timeLimit) {
                    if (mode == 1) {
                        alert("Appointment can not be cancelled now!");
                    }
                } else {
                    if (mode == 1) {
                        alert("Video cancel");
                        $http({
                            method: 'GET',
                            url: domain + 'appointment/dr-cancel-app',
                            params: {appId: $scope.appId, prodId: $scope.prodid, userId: $scope.userId}
                        }).then(function successCallback(response) {
                            console.log(response.data);
                            if (response.data == 'success') {
                                alert('Your appointment is cancelled successfully.');
                                $state.go('app.doctor-consultations', {}, {reload: true});
                            } else {
                                alert('Sorry your appointment is not cancelled.');
                            }
                            $state.go('app.consultations-list', {}, {reload: true});
                        }, function errorCallback(response) {
                            console.log(response);
                        });
                    }
                }
            };
            $scope.joinPatient = function (mode, start, end, appId) {
                console.log(mode + "===" + start + '===' + end + "===" + $scope.curTime + "==" + appId);
                if ($scope.curTime >= start || $scope.curTime <= end) {
                    console.log('redirect');
                    //$state.go('app.patient-join', {}, {reload: true});
                    $state.go('app.doctor-join', {'id': appId, 'mode': mode}, {reload: true});
                } else {
                    alert("You can join video before 15 minutes.");
                }
            };
        })

        .controller('PastChatListCtrl', function ($scope, $http, $ionicLoading, $stateParams, $rootScope, $filter) {
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.curDate = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.interface = window.localStorage.getItem('interface_id');
            $scope.participant = [];
            $scope.msg = [];
            $scope.unreadCnt = [];
            $ionicLoading.show({template: 'Loading...'});
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-past-chats-list',
                params: {drid: $scope.doctorId, interface: $scope.interface}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                $scope.chatParticipants = response.data;

                angular.forEach($scope.chatParticipants, function (value, key) {
                    $ionicLoading.show({template: 'Loading...'});
                    $http({
                        method: 'GET',
                        url: domain + 'doctorsapp/get-chat-msg',
                        params: {partId: value[0].participant_id, chatId: value[0].chat_id}
                    }).then(function successCallback(responseData) {
                        console.log(responseData);
                        $scope.participant[key] = responseData.data.user;
                        $scope.msg[key] = responseData.data.msg;
                        $scope.unreadCnt[key] = responseData.data.unreadCnt;
                        $rootScope.$digest;
                        $ionicLoading.hide();
                    }, function errorCallback(response) {
                        console.log(response.responseText);
                    });
                });
                $ionicLoading.hide();
            }, function errorCallback(e) {
                console.log(e);
            });
        })

        .controller('ChatListCtrl', function ($scope, $http, $stateParams, $rootScope, $filter, $state) {
            $scope.curDate = $filter('date')(new Date(), 'yyyy-MM-dd');
            if (session) {
                session.disconnect();
            }
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.participant = [];
            $scope.msg = [];
            $scope.unreadCnt = [];
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-chats',
                params: {drid: $scope.doctorId}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                //$scope.chatParticipants = response.data;
                $scope.chatParticipants = response.data;
                angular.forEach($scope.chatParticipants, function (value, key) {
                    console.log(value[0].chat_id);
                    $http({
                        method: 'GET',
                        url: domain + 'doctorsapp/get-chat-msg',
                        params: {partId: value[0].participant_id, chatId: value[0].chat_id}
                    }).then(function successCallback(responseData) {
                        // console.log(responseData);
                        //$scope.curDate = $filter('date')(new Date(), 'yyyy-MM-dd');
                        // $scope.chatMsgTime = $filter('date')(new Date(responseData.data.msg.tstamp), 'yyyy-MM-dd');
                        //console.log($scope.curDate + '@@@' + $scope.chatMsgTime);

                        $scope.participant[key] = responseData.data.user;
                        $scope.msg[key] = responseData.data.msg;
                        $scope.unreadCnt[key] = responseData.data.unreadCnt;

                        // 

                        $rootScope.$digest;
                    }, function errorCallback(response) {
                        console.log(response.responseText);
                    });
                });
            }, function errorCallback(e) {
                console.log(e);
            });
            $scope.goChat = function (chatId, chatStart, chatDate) {
                //var chatDate = $filter('date')(chatStart, 'MMM dd, yyyy - HH:mm a');
                if (chatStart <= $scope.curDate)
                    $state.go('app.chat', {'id': chatId}, {reload: true});
                else {
                    alert('You can start chat at ' + chatDate);
                }
            };
            $scope.chatIncludes = [];
            $scope.includeChat = function (state) {
                var i = $.inArray(state, $scope.chatIncludes);
                console.log(i);
                if (i > -1) {
                    $scope.chatIncludes.splice(i, 1);
                } else {
                    $scope.chatIncludes.push(state);
                }
                console.log($scope.chatIncludes);
            };
            $scope.chatFilter = function (chatParticipants) {
                console.log(chatParticipants);
                if ($scope.chatIncludes.length > 0) {
                    console.log($scope.chatIncludes);
                    if ($.inArray(chatParticipants.state, $scope.chatIncludes) == -1) {
                        console.log($.inArray(chatParticipants.state, $scope.chatIncludes));
                        return;
                    }
                }
                console.log(chatParticipants.state);
                return chatParticipants;
            };
        })

        .controller('ChatCtrl', function ($scope, $ionicLoading, $http, $stateParams, $timeout, $filter) {
            $scope.chatId = $stateParams.id;
            window.localStorage.setItem('chatId', $stateParams.id);
            $scope.partId = window.localStorage.getItem('id');
            $scope.msg = '';
            var apiKey = '45121182';
            //console.log($scope.chatId);
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-chat-token',
                params: {chatId: $scope.chatId, userId: $scope.partId}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                $scope.user = response.data.user;
                $scope.otherUser = response.data.otherUser;
                $scope.chatMsgs = response.data.chatMsgs;
                console.log($scope.chatMsgs);
                $scope.token = response.data.token;
                $scope.otherToken = response.data.otherToken;
                $scope.sessionId = response.data.chatSession;
                window.localStorage.setItem('Toid', $scope.otherUser.id);
                //$scope.connect("'" + $scope.token + "'");
                $scope.apiKey = apiKey;
                var session = OT.initSession($scope.apiKey, $scope.sessionId);
                $scope.session = session;
                var chatWidget = new OTSolution.TextChat.ChatWidget({session: $scope.session, container: '#chat'});
                console.log("error source 1" + chatWidget);
                session.connect($scope.token, function (err) {
                    if (!err) {
                        console.log("Connection success");
                    } else {
                        console.error("error source 2" + err);
                    }
                });
            }, function errorCallback(e) {
                console.log(e);
            });

            $scope.returnjs = function () {
                jQuery(function () {
                    var wh = jQuery('window').height();
                    jQuery('#chat').css('height', wh);
                    //	console.log(wh);
                })
            };
            $scope.returnjs();
            $scope.iframeHeight = $(window).height() - 88;
            $('#chat').css('height', $scope.iframeHeight);
            //Previous Chat 
            $scope.appendprevious = function () {
                console.log('connectioning.....');
                $ionicLoading.show({template: 'Retrieving messages...'});
                $(function () {
                    angular.forEach($scope.chatMsgs, function (value, key) {
                        //console.log(value);
                        var msgTime = $filter('date')(new Date(value.tstamp), 'd MMM, yyyy - HH:mm a');

                        if (value.sender_id == $scope.partId) {
                            $ionicLoading.hide();
                            $('#chat .ot-textchat .ot-bubbles').append('<section class="ot-bubble mine" data-sender-id=""><div><header class="ot-bubble-header"><p class="ot-message-sender"></p><time class="ot-message-timestamp">' + msgTime + '</time></header><div class="ot-message-content">' + value.message + '</div></div></section>');
                        } else {
                            $ionicLoading.hide();
                            $('#chat .ot-textchat .ot-bubbles').append('<section class="ot-bubble" data-sender-id=""><div><header class="ot-bubble-header"><p class="ot-message-sender"></p><time class="ot-message-timestamp">' + msgTime + '</time></header><div class="ot-message-content">' + value.message + '</div></div></section>');
                        }
                    });
                })
            };

            $scope.movebottom = function () {
                jQuery(function () {
                    var dh = $('.ot-bubbles').height();
                    $('.chatscroll').scrollTop(dh);
                    //	console.log(wh);

                })
            };

            $timeout(function () {

                $scope.appendprevious();
                $scope.movebottom();
            }, 1000);
        })

        .controller('PastChatCtrl', function ($scope, $ionicLoading, $http, $stateParams, $timeout, $filter) {
            $scope.chatId = $stateParams.id;
            window.localStorage.setItem('chatId', $stateParams.id);
            $scope.partId = window.localStorage.getItem('id');
            $scope.msg = '';
            var apiKey = '45121182';
            //console.log($scope.chatId);
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-chat-token-past',
                params: {chatId: $scope.chatId, userId: $scope.partId}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                $scope.user = response.data.user;
                $scope.otherUser = response.data.otherUser;
                $scope.chatMsgs = response.data.chatMsgs;
                $scope.sessionId = response.data.chatSession;
                console.log(response.data.chatMsgs);
                $scope.apiKey = apiKey;


                //  console.log("error source 1" + chatWidget);

            }, function errorCallback(e) {
                console.log(e);
            });
            $scope.returnjs = function () {
                jQuery(function () {
                    var wh = jQuery('window').height();
                    jQuery('#pchat').css('height', wh);

                    //	console.log(wh);
                })
            };
            $scope.returnjs();
            $scope.iframeHeight = $(window).height() - 87;
            $('#pchat').css('height', $scope.iframeHeight);
            //Previous Chat 

            $scope.appendprevious = function () {
                //  console.log('connectioning.....');
                $ionicLoading.show({template: 'Retrieving messages...'});
                //  console.log('connectioning.....1');
                $(function () {
                    jQuery('.ot-textchat .ot-input').remove();
                    // console.log('connectioning.....12');
                    angular.forEach($scope.chatMsgs, function (value, key) {
                        //console.log(value);
                        // console.log('connectioning.....123');
                        var msgTime = $filter('date')(new Date(value.tstamp), 'd MMM, yyyy - HH:mm a');

                        if (value.sender_id == $scope.partId) {
                            // console.log('connectioning.....1234');
                            $ionicLoading.hide();
                            $('#pchat .ot-textchat .ot-bubbles').append('<section class="ot-bubble mine" data-sender-id=""><div><header class="ot-bubble-header"><p class="ot-message-sender"></p><time class="ot-message-timestamp">' + msgTime + '</time></header><div class="ot-message-content">' + value.message + '</div></div></section>');
                        } else {
                            $ionicLoading.hide();
                            $('#pchat .ot-textchat .ot-bubbles').append('<section class="ot-bubble" data-sender-id=""><div><header class="ot-bubble-header"><p class="ot-message-sender"></p><time class="ot-message-timestamp">' + msgTime + '</time></header><div class="ot-message-content">' + value.message + '</div></div></section>');
                        }
                    });
                })
            };

            $scope.movebottom = function () {
                jQuery(function () {
                    var dh = $('.ot-bubbles').height();
                    $('.chatscroll').scrollTop(dh);
                    //	console.log(wh);

                })
            };

            $timeout(function () {

                $scope.appendprevious();
                $scope.movebottom();
            }, 1000);
        })

        .controller('AssistantChatListCtrl', function ($scope, $http, $stateParams, $rootScope, $filter) {
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.participant = [];
            $scope.msg = [];
            $scope.unreadCnt = [];
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-assistant-chats',
                params: {drid: $scope.doctorId}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                //$scope.chatParticipants = response.data;
                $scope.chatParticipants = response.data;
                angular.forEach($scope.chatParticipants, function (value, key) {
                    console.log(value[0].chat_id);
                    $http({
                        method: 'GET',
                        url: domain + 'doctorsapp/get-chat-msg',
                        params: {partId: value[0].participant_id, chatId: value[0].chat_id}
                    }).then(function successCallback(responseData) {
                        console.log(responseData);
                        $scope.participant[key] = responseData.data.user;
                        $scope.msg[key] = responseData.data.msg;
                        $scope.unreadCnt[key] = responseData.data.unreadCnt;
                        $rootScope.$digest;
                    }, function errorCallback(response) {
                        console.log(response.responseText);
                    });
                });
            }, function errorCallback(e) {
                console.log(e);
            });
        })

        .controller('AssistantChatCtrl', function ($scope, $http, $stateParams, $timeout, $filter) {
            $scope.chatId = $stateParams.id;
            window.localStorage.setItem('chatId', $stateParams.id);
            $scope.partId = window.localStorage.getItem('id');
            $scope.msg = '';
            var apiKey = '45121182';
            //console.log($scope.chatId);
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-assistant-chat-token',
                params: {chatId: $scope.chatId, userId: $scope.partId}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                $scope.user = response.data.user;
                $scope.otherUser = response.data.otherUser;
                $scope.chatMsgs = response.data.chatMsgs;
                console.log($scope.chatMsgs);
                $scope.token = response.data.token;
                $scope.otherToken = response.data.otherToken;
                $scope.sessionId = response.data.chatSession;
                window.localStorage.setItem('Toid', $scope.otherUser.id);
                //$scope.connect("'" + $scope.token + "'");
                $scope.apiKey = apiKey;
                var session = OT.initSession($scope.apiKey, $scope.sessionId);
                $scope.session = session;
                var chatWidget = new OTSolution.TextChat.ChatWidget({session: $scope.session, container: '#chat'});
                console.log(chatWidget);
                session.connect($scope.token, function (err) {
                    if (!err) {
                        console.log("Connection success");
                    } else {
                        console.error(err);
                    }
                });

            }, function errorCallback(e) {
                console.log(e);
            });

            $scope.returnjs = function () {
                jQuery(function () {
                    var wh = jQuery('window').height();
                    jQuery('#chat').css('height', wh);
                    //	console.log(wh);

                })
            };
            $scope.returnjs();
            $scope.iframeHeight = $(window).height() - 88;
            $('#chat').css('height', $scope.iframeHeight);
//Previous Chat 
            $scope.appendprevious = function () {
                $(function () {
                    angular.forEach($scope.chatMsgs, function (value, key) {
                        //console.log(value);
                        var msgTime = $filter('date')(new Date(value.tstamp), 'hh:mm a');
                        if (value.sender_id == $scope.partId) {
                            $('#chat .ot-textchat .ot-bubbles').append('<section class="ot-bubble mine" data-sender-id=""><div><header class="ot-bubble-header"><p class="ot-message-sender"></p><time class="ot-message-timestamp">' + msgTime + '</time></header><div class="ot-message-content">' + value.message + '</div></div></section>');
                        } else {
                            $('#chat .ot-textchat .ot-bubbles').append('<section class="ot-bubble" data-sender-id=""><div><header class="ot-bubble-header"><p class="ot-message-sender"></p><time class="ot-message-timestamp">' + msgTime + '</time></header><div class="ot-message-content">' + value.message + '</div></div></section>');
                        }
                    });
                })
            };
            $timeout(function () {
                $scope.appendprevious();
            }, 1000);
        })

        .controller('InveSearchCtrl', function ($scope, $http, $stateParams, $rootScope, $ionicModal) {
            $scope.searchkey = $stateParams.key;

            console.log("@@@@@@@----" + $scope.searchkey);
            $http({
                method: 'GET',
                url: domain + 'inventory/search-medicine-doctor',
                params: {id: $scope.id, interface: $scope.interface, key: $scope.searchkey}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.getMedicine = response.data.getMedicine;
                $scope.otherMedicine = response.data.otherMedicine;
                $scope.telecentre = response.data.telecentre;
                $scope.getLocation = response.data.getLocation;
                var data = response.data.getLocation;
                $scope.location = _.reduce(
                        data,
                        function (output, name) {
                            var lCase = name.name.toUpperCase();
                            if (output[lCase[0]]) //if lCase is a key
                                output[lCase[0]].push(name); //Add name to its list
                            else
                                output[lCase[0]] = [name]; // Else add a key
                            console.log(output);
                            return output;
                        },
                        {}
                );
            }, function errorCallback(response) {
                console.log(response);
            });

            $scope.searchByMedicine = function (searchkey) {
                $scope.searchkey = searchkey
                alert($scope.searchkey);
                $http({
                    method: 'GET',
                    url: domain + 'inventory/search-medicine-by-name',
                    params: {id: $scope.id, interface: $scope.interface, key: $scope.searchkey}
                }).then(function successCallback(response) {
                    $scope.getMedicine = response.data.getMedicine;
                    $scope.otherMedicine = response.data.otherMedicine;
                    // $scope.golink('#/app/inventory/search/' + $scope.searchkey);
                }, function errorCallback(response) {
                    console.log(response);
                });
            };
        })

        .controller('InveLocationCtrl', function ($scope, $http, $stateParams, $rootScope, $ionicModal) {
            $scope.searchkey = $stateParams.key;
            // alert($scope.searchkey);
            console.log("@@@@@@@#####" + $scope.searchkey);
            $http({
                method: 'GET',
                url: domain + 'inventory/search-medicine-doctor',
                params: {id: $scope.id, interface: $scope.interface, key: $scope.searchkey}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.getMedicine = response.data.getMedicine;
                $scope.otherMedicine = response.data.otherMedicine;
                $scope.telecentre = response.data.telecentre;
                $scope.getLocation = response.data.getLocation;
                var data = response.data.getLocation;
                $scope.location = _.reduce(
                        data,
                        function (output, name) {
                            var lCase = name.name.toUpperCase();
                            if (output[lCase[0]]) //if lCase is a key
                                output[lCase[0]].push(name); //Add name to its list
                            else
                                output[lCase[0]] = [name]; // Else add a key
                            console.log(output);
                            return output;
                        },
                        {}
                );

            }, function errorCallback(response) {
                console.log(response);
            });

            $scope.changeLocation = function (locationid) {
                $scope.searchkey = locationid;
                // alert($scope.searchkey);
                $http({
                    method: 'GET',
                    url: domain + 'inventory/search-medicine-doctor',
                    params: {id: $scope.id, interface: $scope.interface, key: $scope.searchkey}
                }).then(function successCallback(response) {
                    console.log(response.data);
                    $scope.getMedicine = response.data.getMedicine;
                    $scope.otherMedicine = response.data.otherMedicine;

                    $scope.telecentre = response.data.telecentre;
                    $scope.getLocation = response.data.getLocation;

                    var data = response.data.getLocation;
                    $scope.location = _.reduce(
                            data,
                            function (output, name) {
                                var lCase = name.name.toUpperCase();
                                if (output[lCase[0]]) //if lCase is a key
                                    output[lCase[0]].push(name); //Add name to its list
                                else
                                    output[lCase[0]] = [name]; // Else add a key
                                console.log(output);
                                return output;
                            },
                            {}
                    );
                }, function errorCallback(response) {
                    console.log(response);
                });
            };
        })

        .controller('DoctorJoinCtrl', function ($ionicLoading, $scope, $http, $compile, $timeout, $stateParams, $cordovaCamera, $ionicHistory, $ionicPopup, $state, $window, $filter) {

            $ionicLoading.show({template: 'Loading...'});

//            if (!get('loadedOnce')) {
//                store({'loadedOnce': 'true'});
//                $window.location.reload(true);
//                // don't reload page, but clear localStorage value so it'll get reloaded next time
//
//            } else {
//                // set the flag and reload the page
//                window.localStorage.removeItem('loadedOnce');
//            }

            $scope.curDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            var imgCnt = 0;
            $scope.images = [];
            $scope.image = [];
            $scope.tempImgs = [];
            //$ionicHistory.clearCache();
            $scope.appId = $stateParams.id;
            $scope.userId = get('id');
            $scope.caseId = '';
            $scope.recId = '';
            $scope.medicinename = '';
            $scope.prescription = 'Yes';
            var stoppedTimer;
            $scope.Timercounter;
            var statstimer;
            $scope.$on('$destroy', function () {

                try {
                    publisher.off();
                    //alert('EXIT : publisher off try');
                    publisher.destroy();
                    //alert('publisher destroy');
                    subscriber.destroy();
                    //alert('subscriber destroy');
                    //session.unsubscribe();
                    session.off();
                    //alert('EXIT : session off');
                    session.disconnect();
                    // alert('session disconnected try');
                    $ionicHistory.nextViewOptions({
                        historyRoot: true
                    })
                    window.clearInterval(statstimer);
                    statstimer = '';

                } catch (err) {
                    //alert('err while exitvideo ' + err);
                    session.off();
                    //alert('EXIT : session off catch');
                    session.disconnect();
                    //alert('session disconnected');
                    $ionicHistory.nextViewOptions({
                        historyRoot: true
                    })
                    window.clearInterval(statstimer);
                    statstimer = '';

                }
            });
            $scope.pushEvent = 'video_join';
            $http({
                method: 'GET',
                url: domain + 'appointment/join-patient',
                params: {id: $scope.appId, userId: $scope.userId}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                $scope.user = response.data.user;
                $scope.appDetails = response.data.app;

                //$scope.oToken = "https://test.doctrs.in/opentok/opentok?session=" + response.data.app[0].appointments.opentok_session_id;
                var apiKey = '45121182';
                var sessionId = response.data.app[0].appointments.opentok_session_id;
                var token = response.data.oToken;
                if (OT.checkSystemRequirements() == 1) {
                    session = OT.initSession(apiKey, sessionId);
                    $ionicLoading.hide();
                } else {
                    $ionicLoading.hide();
                    alert("Your device is not compatible");
                }
                session.on({
                    streamDestroyed: function (event) {
                        event.preventDefault();
                        window.clearInterval(statstimer);
                        statstimer = '';
                        var subscribers = session.getSubscribersForStream(event.stream);
                        console.log('stream distroy: ' + subscribers);
                        //alert('stream distroy length: ' + subscribers.length);
                        console.log('on stream Destroy reason: ' + event.reason);
                        //alert('on stream Destroy reason: ' + event.reason);
                        jQuery("#subscribersDiv").html("Patient Left the Consultation");
                        session.unsubscribe();
                    },
                    streamCreated: function (event) {
                        subscriber = session.subscribe(event.stream, 'subscribersDiv', {subscribeToAudio: true, insertMode: "replace", width: "100%", height: "100%"},
                                function (error) {
                                    if (error) {
                                        console.log("subscriber Error " + error.code + '--' + error.message);
                                    } else {
                                        console.log('Subscriber added.');
                                        var subscribers2 = session.getSubscribersForStream(event.stream);
                                        console.log('Subscriber length.' + subscribers2.length);
                                        //alert('APK Subscriber length.' + subscribers2.length)
                                        console.log('stream created: ' + subscribers2);
                                        var prevStats;
                                        statstimer = window.setInterval(function () {
                                            $ionicLoading.hide();
                                            subscriber.getStats(function (error, stats) {
                                                if (error) {
                                                    console.error('Error getting subscriber stats. ', error.message);
                                                    return;
                                                }
                                                if (prevStats) {
                                                    var videoPacketLossRatio = stats.video.packetsLost /
                                                            (stats.video.packetsLost + stats.video.packetsReceived);
                                                    console.log('video packet loss ratio: ', videoPacketLossRatio);
                                                    var videoBitRate = 8 * (stats.video.bytesReceived - prevStats.video.bytesReceived);
                                                    console.log('video bit rate: ', videoBitRate, 'bps');
                                                    var audioPacketLossRatio = stats.audio.packetsLost /
                                                            (stats.audio.packetsLost + stats.audio.packetsReceived);
                                                    console.log('audio packet loss ratio: ', audioPacketLossRatio);
                                                    var audioBitRate = 8 * (stats.audio.bytesReceived - prevStats.audio.bytesReceived);
                                                    console.log('audio bit rate: ', audioBitRate, 'bps');

                                                    $http({
                                                        method: 'GET',
                                                        url: domain + 'log/stats-log',
                                                        params: {id: $scope.appId,
                                                            userId: $scope.userId,
                                                            videoPacketLossRatio: videoPacketLossRatio,
                                                            videoBitRate: videoBitRate,
                                                            audioPacketLossRatio: audioPacketLossRatio,
                                                            audioBitRate: audioBitRate
                                                        }
                                                    }).then(function successCallback(response) {

                                                    }, function errorCallback(e) {

                                                    });
                                                }
                                                prevStats = stats;
                                            });
                                        }, 5000);
                                    }
                                });

                    },
                    sessionDisconnected: function (event) {
                        var subscribers3 = session.getSubscribersForStream(event.stream);
                        console.log('sessionDisconnected : ' + subscribers3);
                        if (event.reason === 'networkDisconnected') {
                            $ionicLoading.hide();
                            alert('You lost your internet connection.'
                                    + 'Please check your connection and try connecting again.');
                            var subscribers4 = session.getSubscribersForStream(event.stream);
                            console.log('sessionDisconnected----1 : ' + subscribers4.length);


                        }
                    }
                });

                session.connect(token, function (error) {
                    if (error) {
                        $ionicLoading.hide();
                        alert("Error connecting session doctors: ", error.code, error.message);
                    } else {
                        publisher = OT.initPublisher('myPublisherDiv', {width: "30%", height: "30%"});
                        //  session.publish(publisher);
                        session.publish(publisher, function (error) {
                            if (error) {
                                console.log("publisher Error code/msg: ", error.code, error.message);

                            } else {
                                //alert($scope.appDetails[0].appointments.scheduled_start_time);
                                if ($scope.curDate >= $scope.appDetails[0].appointments.scheduled_start_time && $scope.curDate <= $scope.appDetails[0].appointments.scheduled_end_time) {
                                    console.log('inside appt, between tym');
                                    $scope.Timercounter = getTimeDiffSec($scope.appDetails[0].appointments.scheduled_start_time, $scope.curDate);
                                    console.log('getTimeDiffSec' + getTimeDiffSec($scope.appDetails[0].appointments.scheduled_start_time, $scope.curDate));
                                    $scope.onTimeout = function () {
                                        stoppedTimer = $timeout(function () {
                                            $scope.Timercounter++;
                                            $scope.seconds = $scope.Timercounter % 60;
                                            $scope.minutes = Math.floor($scope.Timercounter / 60);
                                            //  var mytimeout = $timeout($scope.onTimeout, 1000);
                                            $scope.result = ($scope.minutes < 10 ? "0" + $scope.minutes : $scope.minutes);
                                            $scope.result += ":" + ($scope.seconds < 10 ? "0" + $scope.seconds : $scope.seconds);
                                            $scope.onTimeout();
                                        }, 1000)
                                    }

                                    $timeout(function () {
                                        $scope.onTimeout();
                                    }, 0);
                                } else {
                                    $scope.Timercounter = '00:00';
                                }
                                $http({
                                    method: 'GET',
                                    url: domain + 'notification/push-notification',
                                    params: {id: $scope.appId, userId: $scope.userId, pushEvent: $scope.pushEvent}
                                }).then(function successCallback(response) {


                                }, function errorCallback(e) {
                                });
                                publisher.on('streamCreated', function (event) {
                                    var subscribers5 = session.getSubscribersForStream(event.stream);
                                    //console.log('on publish: ' + subscribers5);
                                    console.log('on publish lenghth.' + subscribers5.length);
                                    //  alert('APK on publish lenghth.');
                                    //  console.log('stream created: ' + subscribers5);
                                });

                                publisher.on('streamDestroyed', function (event) {
                                    var subscribers6 = session.getSubscribersForStream(event.stream);
                                    console.log('on Destroy: ' + subscribers6);
                                    // alert('on Destroy: ' + subscribers6)
                                    console.log('on Destroy reason: ' + event.reason);
                                    //alert('on Destroy reason: ' + event.reason);
                                    //  session.unsubscribe();
                                    subscriber.destroy();
                                    // alert("publisher.destroy");
                                    // console.log("subscriber.destroy" + subscriber.destroy);
                                    // session.disconnect()
                                });


                                var mic = 1;
                                var mute = 1;
                                var mutevideo = 1;

                                jQuery(".muteVideo").click(function () {
                                    console.log("Vcvxcvxc");
                                    if (mutevideo == 1) {
                                        publisher.publishVideo(false);
                                        mutevideo = 0;
                                    } else {
                                        publisher.publishVideo(true);
                                        mutevideo = 1;
                                    }
                                });
                                jQuery(".muteMic").click(function () {
                                    if (mic == 1) {
                                        publisher.publishAudio(false);
                                        mic = 0;
                                    } else {
                                        publisher.publishAudio(true);
                                        mic = 1;
                                    }
                                });
                                jQuery(".muteSub").click(function () {
                                    if (mute == 1) {
                                        subscriber.subscribeToAudio(false);
                                        mute = 0;
                                    } else {
                                        subscriber.subscribeToAudio(true);
                                        mute = 1;
                                    }
                                });
                            }
                        });

                    }
                });
            }, function errorCallback(e) {
                console.log(e);
            });

            $scope.adjquery = function () {
                jQuery(function () {
                    console.log('call function');
                    var b = jQuery('iframe').contents().find('body .iframeclose');

                    $(b).on("click", function () {
                        jQuery('.ciframecontainer').removeClass('active');
                    })

                })
            };

            $scope.golink = function (fsrc) {
                console.log(" dfgshjdgf " + fsrc);
                jQuery('iframe').attr('src', fsrc);
                jQuery('.ciframecontainer').addClass('active');
                // jQuery('.ciframecontainer').append('<iframe src="'+fsrc+'" id="'+fsrc+'"></iframe>');
                jQuery('.custpopup-container').removeClass('active');
                $scope.adjquery();
            };

            $scope.closeiframe = function () {
                jQuery('.ciframecontainer').removeClass('active');
            };

            $timeout(function () {
                $scope.adjquery();
            }, 4000);



            //ADD Consultation note
            $http({
                method: "GET",
                url: domain + "doctrsrecords/get-app-details",
                params: {appId: $scope.appId}
            }).then(function successCallback(response) {
                console.log(response.data.patient.id);
                $scope.patientId = response.data.patient.id;
                $scope.doctorId = response.data.doctr.id
                $scope.app = response.data.app;
                $scope.record = response.data.record;
                $scope.recordDetails = response.data.recordDetails;
                if ($scope.recordDetails.length > 0) {
                    angular.forEach($scope.recordDetails, function (val, key) {
                        if (val.fields.field == 'Case Id') {
                            $scope.caseId = val.value;
                            $scope.casetype = 0;
                            jQuery('.fields #precase').removeClass('hide');
                        }
                    });
                    $scope.recId = response.data.record.id;
                }
                if (response.data.app.mode == 1) {
                    $scope.mode = 'Video';
                } else if (response.data.app.mode == 2) {
                    $scope.mode = 'Chat';
                } else if (response.data.app.mode = 3) {
                    $scope.mode = 'Clinic'
                } else if (response.data.app.mode == 4) {
                    $scope.mode = 'Home';
                }
                console.log($scope.mode);
                $scope.conDate = $filter('date')(new Date(response.data.app.scheduled_start_time), 'dd-MM-yyyy'); //response.data.app.scheduled_start_time; //$filter('date')(new Date(), 'MM-dd-yyyy');
                $scope.curTimeo = $filter('date')(new Date(response.data.app.scheduled_start_time), 'hh:mm a');
                window.localStorage.setItem('patientId', $scope.patientId);
                window.localStorage.setItem('doctorId', $scope.doctorId);
                console.log($scope.conDate);
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/get-fields',
                    params: {patient: $scope.patientId, userId: $scope.userId, catId: $scope.catId}
                }).then(function successCallback(response) {
                    console.log(response.data);
                    $scope.record = response.data.record;
                    $scope.fields = response.data.fields;
                    $scope.problems = response.data.problems;
                    $scope.doctrs = response.data.doctrs;
                    $scope.patients = response.data.patients;
                    $scope.cases = response.data.cases;
                }, function errorCallback(response) {
                    console.log(response);
                });
            }, function errorCallback(e) {
                console.log(e);
            });
            $scope.submit = function () {
                $ionicLoading.show({template: 'Adding...'});
                //alert($scope.tempImgs.length);
                if ($scope.tempImgs.length > 0) {
                    angular.forEach($scope.tempImgs, function (value, key) {
                        $scope.picData = getImgUrl(value);
                        var imgName = value.substr(value.lastIndexOf('/') + 1);
                        $scope.ftLoad = true;
                        $scope.uploadPicture();
                        $scope.image.push(imgName);
                        console.log($scope.image);
                    });
                    jQuery('#camfilee').val($scope.image);
                    console.log($scope.images);
                    var data = new FormData(jQuery("#addRecordForm")[0]);
                    callAjax("POST", domain + "doctrsrecords/save-consultation", data, function (response) {
                        console.log(response);
                        $ionicLoading.hide();
                        if (angular.isObject(response.records)) {
                            $scope.image = [];
                            $scope.records = response.records;
                            $scope.recordDetails = response.recordDetails;
                            if ($scope.recordDetails.length > 0) {
                                angular.forEach($scope.recordDetails, function (val, key) {
                                    if (val.fields.field == 'Case Id') {
                                        $scope.caseId = val.value;
                                        $scope.casetype = 0;
                                        jQuery('.fields #precase').removeClass('hide');
                                    }
                                });
                                $scope.recId = response.records.id;
                            }
                            alert("Consultation Note added successfully!");
                            $scope.removenoteslide();
                        } else if (response.err != '') {
                            alert('Please fill mandatory fields');
                        }
                    });
                } else {
                    var data = new FormData(jQuery("#addRecordForm")[0]);
                    callAjax("POST", domain + "doctrsrecords/save-consultation", data, function (response) {
                        console.log(response);
                        $ionicLoading.hide();
                        if (angular.isObject(response.records)) {
                            $scope.records = response.records;
                            $scope.recordDetails = response.recordDetails;
                            if ($scope.recordDetails.length > 0) {
                                angular.forEach($scope.recordDetails, function (val, key) {
                                    if (val.fields.field == 'Case Id') {
                                        $scope.caseId = val.value;
                                        $scope.casetype = 0;
                                        jQuery('.fields #precase').removeClass('hide');
                                    }
                                });
                                $scope.recId = response.records.id;
                            }
                            alert("Consultation Note added successfully!");
                            $scope.removenoteslide();
                        } else if (response.err != '') {
                            alert('Please fill mandatory fields');
                        }
                    });
                }

                function getImgUrl(imageName) {
                    var name = imageName.substr(imageName.lastIndexOf('/') + 1);
                    var trueOrigin = cordova.file.dataDirectory + name;
                    return trueOrigin;
                }
            };
            $scope.getCase = function (type) {
                console.log(type);
                if (type == 1) {
                    jQuery(".fields #precase").addClass('hide');
                    jQuery(".fields #newcase").removeClass('hide');
                } else if (type == 0) {
                    jQuery(".fields #precase").removeClass('hide');
                    jQuery(".fields #newcase").addClass('hide');
                }
            };
            $scope.getPrescription = function (pre) {
                console.log('pre ' + pre);
                if (pre === ' No') {
                    console.log("no");
                    jQuery('#convalid').addClass('hide');
                } else if (pre === 'Yes') {
                    console.log("yes");
                    jQuery('#convalid').removeClass('hide');
                }
            };
            //Take images with camera
            $scope.takePict = function (name) {
                //console.log(name);
                var camimg_holder = $("#camera-status");
                //camimg_holder.empty();
                // 2
                var options = {
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                };
                // 3
                $cordovaCamera.getPicture(options).then(function (imageData) {
                    //alert(imageData);
                    onImageSuccess(imageData);
                    function onImageSuccess(fileURI) {
                        createFileEntry(fileURI);
                    }
                    function createFileEntry(fileURI) {
                        window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
                    }
                    // 5
                    function copyFile(fileEntry) {
                        var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                        var newName = makeid() + name;
                        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (fileSystem2) {
                            fileEntry.copyTo(
                                    fileSystem2,
                                    newName,
                                    onCopySuccess,
                                    fail
                                    );
                        },
                                fail);
                    }
                    // 6
                    function onCopySuccess(entry) {
                        var imageName = entry.nativeURL;
                        $scope.$apply(function () {
                            $scope.tempImgs.push(imageName);
                        });
                        console.log($scope.tempImgs.length);
                        if ($scope.tempImgs.length == 0) {
                            console.log($("#image-holder").html());
                            if (($("#image-holder").html()) == '') {
                                //jQuery('#convalid').addClass('hide');
                                jQuery('#coninprec').addClass('hide');
                            } else {
                                //jQuery('#convalid').removeClass('hide');
                                jQuery('#coninprec').removeClass('hide');
                            }
                        } else {
                            //jQuery('#convalid').removeClass('hide');
                            jQuery('#coninprec').removeClass('hide');
                        }
                        $scope.picData = getImgUrl(imageName);
                        //alert($scope.picData);
                        $scope.ftLoad = true;
                        imgCnt++;
                        var btnhtml = $compile('<div class="remcam-' + imgCnt + '"><button class="button button-positive remove" ng-click="removeCamFile(\'' + imgCnt + '\')">X</button></div>')($scope);
                        camimg_holder.append(btnhtml);
                        $('<div class="remcam-' + imgCnt + '"><span class="upattach"><i class="ion-paperclip"></i></span></div>').appendTo(camimg_holder);
                    }
                    function fail(error) {
                        console.log("fail: " + error.code);
                    }
                    function makeid() {
                        var text = "";
                        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                        for (var i = 0; i < 5; i++) {
                            text += possible.charAt(Math.floor(Math.random() * possible.length));
                        }
                        return text;
                    }
                    function getImgUrl(imageName) {
                        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
                        var trueOrigin = cordova.file.dataDirectory + name;
                        return trueOrigin;
                    }
                }, function (err) {
                    console.log(err);
                });
            };
            $scope.removeCamFile = function (img) {
                var arrInd = (img - 1);
                var index = $scope.tempImgs.indexOf(arrInd);
                $scope.tempImgs.splice(index, 1);
                console.log('camera file removed');
                console.log($scope.tempImgs);
                jQuery('.remcam-' + img).remove();
                if ($scope.tempImgs.length == 0) {
                    if (($("#image-holder").html()) == '') {
                        //jQuery('#convalid').addClass('hide');
                        jQuery('#coninprec').addClass('hide');
                    } else {
                        //jQuery('#convalid').removeClass('hide');
                        jQuery('#coninprec').removeClass('hide');
                    }
                } else {
                    //jQuery('#convalid').removeClass('hide');
                    jQuery('#coninprec').removeClass('hide');
                }
            };
            $scope.uploadPicture = function () {
                //$ionicLoading.show({template: 'Uploading..'});
                var fileURL = $scope.picData;
                var name = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                options.mimeType = "image/jpeg";
                options.chunkedMode = true;
                var params = {};
//                params.value1 = "someparams";
//                params.value2 = "otherparams";
//                options.params = params;
                var uploadSuccess = function (response) {
                    alert('Upload Success  ');
                    console.log("Code = " + r.responseCode);
                    console.log("Response = " + r.response);
                    console.log("Sent = " + r.bytesSent);
                    //$scope.image.push(name);
                    //$ionicLoading.hide();
                }
                var ft = new FileTransfer();
                ft.upload(fileURL, encodeURI(domain + 'doctrsrecords/upload-attachment'), uploadSuccess, function (error) {
                    console.log("Error in uploading!!!");
                    //$ionicLoading.show({template: 'Error in connecting...'});
                    //$ionicLoading.hide();
                }, options);
            };
            $scope.setFile = function (element) {
                $scope.currentFile = element.files[0];
                console.log('length = ' + element.files.length);
                var image_holder = $("#image-holder");
                image_holder.empty();
                if (element.files.length > 0) {
                    console.log($("#camera-status").html());
                    //jQuery('#convalid').removeClass('hide');
                    jQuery('#coninprec').removeClass('hide');
                    //jQuery('#valid-till').attr('required', true);
                    image_holder.append('<button class="button button-positive remove" onclick="removeFile()">Remove Files</button><br/>');
                } else {
                    if (($("#camera-status").html()) != '') {
                        //jQuery('#convalid').removeClass('hide');
                        jQuery('#coninprec').removeClass('hide');
                    } else {
                        //jQuery('#convalid').addClass('hide');
                        jQuery('#coninprec').addClass('hide');
                    }
                    //jQuery('#valid-till').attr('required', false);
                }
                if (typeof (FileReader) != "undefined") {
                    //loop for each file selected for uploaded.
                    for (var i = 0; i < element.files.length; i++) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
//                            $("<img />", {
//                                "src": e.target.result,
//                                "class": "thumb-image"
//                            }).appendTo(image_holder);
                            $('<span class="upattach"><i class="ion-paperclip"></i></span>').appendTo(image_holder);
                        }
                        image_holder.show();
                        reader.readAsDataURL(element.files[0]);
                    }
                }
            };

            //End Consultaion code
            $scope.exitVideo = function () {
                try {
                    $timeout.cancel(stoppedTimer);
                    publisher.off();
                    // alert('EXIT : publisher off try');
                    publisher.destroy();
                    //alert('publisher destroy');
                    subscriber.destroy();
                    //alert('subscriber destroy');
                    //session.unsubscribe();
                    session.off();
                    //alert('EXIT : session off');
                    session.disconnect();
                    // alert('session disconnected try');
                    window.clearInterval(statstimer);
                    statstimer = '';
                    $ionicHistory.nextViewOptions({
                        historyRoot: true
                    })

                } catch (err) {
                    $timeout.cancel(stoppedTimer);
                    // alert('err while exitvideo ' + err);
                    session.off();
                    // alert('EXIT : session off catch');
                    session.disconnect();
                    // alert('session disconnected');
                    $ionicHistory.nextViewOptions({
                        historyRoot: true
                    })
                    window.clearInterval(statstimer);
                    statstimer = '';
                }
                $http({
                    method: 'GET',
                    url: domain + 'appointment/doctor-exit-video',
                    params: {id: $scope.appId, userId: $scope.userId}
                }).then(function successCallback(response) {
                    $state.go('app.doctor-consultations', {}, {reload: true});

                }, function errorCallback(e) {

                    $state.go('app.consultations-current', {}, {reload: true});
                });
            };

            $scope.addnote = function () {

                //Consusltation note details fetch
                $http({
                    method: "GET",
                    url: domain + "doctrsrecords/get-app-details",
                    params: {appId: $scope.appId}
                }).then(function successCallback(response) {
                    console.log(response.data.patient.id);
                    $scope.patientId = response.data.patient.id;
                    $scope.doctorId = response.data.doctr.id
                    $scope.app = response.data.app;
                    $scope.record = response.data.record;
                    $scope.recordDetails = response.data.recordDetails;
                    if ($scope.recordDetails.length > 0) {
                        angular.forEach($scope.recordDetails, function (val, key) {
                            if (val.fields.field == 'Case Id') {
                                $scope.caseId = val.value;
                                $scope.casetype = 0;
                                jQuery('.fields #precase').removeClass('hide');
                            }
                        });
                        $scope.recId = response.data.record.id;
                    }
                    if (response.data.app.mode == 1) {
                        $scope.mode = 'Video';
                    } else if (response.data.app.mode == 2) {
                        $scope.mode = 'Chat';
                    } else if (response.data.app.mode = 3) {
                        $scope.mode = 'Clinic'
                    } else if (response.data.app.mode == 4) {
                        $scope.mode = 'Home';
                    }
                    console.log($scope.mode);
                    $scope.conDate = $filter('date')(new Date(response.data.app.scheduled_start_time), 'dd-MM-yyyy'); //response.data.app.scheduled_start_time; //$filter('date')(new Date(), 'MM-dd-yyyy');
                    $scope.curTimeo = $filter('date')(new Date(response.data.app.scheduled_start_time), 'hh:mm a');
                    window.localStorage.setItem('patientId', $scope.patientId);
                    window.localStorage.setItem('doctorId', $scope.doctorId);
                    console.log($scope.conDate);
                    $http({
                        method: 'GET',
                        url: domain + 'doctrsrecords/get-fields',
                        params: {patient: $scope.patientId, userId: $scope.userId, catId: $scope.catId}
                    }).then(function successCallback(response) {
                        console.log(response.data);
                        $scope.record = response.data.record;
                        $scope.fields = response.data.fields;
                        $scope.problems = response.data.problems;
                        $scope.doctrs = response.data.doctrs;
                        $scope.patients = response.data.patients;
                        $scope.cases = response.data.cases;
                    }, function errorCallback(response) {
                        console.log(response);
                    });
                }, function errorCallback(e) {
                    console.log(e);
                });
                jQuery('.mediascreen').toggleClass('minscreen');
                jQuery('#consultnote-slide').toggleClass('active');
                jQuery('#inventory-slide').removeClass('active');
            };

            $scope.removenoteslide = function () {
                jQuery('.mediascreen').removeClass('minscreen');
                jQuery('#consultnote-slide').removeClass('active');
                jQuery('#inventory-slide').removeClass('active');
                jQuery('.ciframecontainer').removeClass('active');
            };

            $scope.inventory = function () {
                jQuery('.mediascreen').toggleClass('minscreen');
                jQuery('#inventory-slide').toggleClass('active');
                jQuery('#consultnote-slide').removeClass('active');
            };
            $scope.invsearcha = true;
            $scope.invsearch = function () {
                console.log('fadsf');
                //$scope.invsearcha=false;
                $scope.searchbox = true;
            };

            /* $http({
             method: 'GET',
             url: domain + 'inventory/get-all-phc-location',
             params: {interface: $scope.interface}
             }).then(function successCallback(response) {
             console.log(response.data);
             $scope.healthCenter = response.data.telecentre;
             }, function errorCallback(e) {
             console.log(e);
             });*/

            $scope.searchBy = function (type) {
                console.log(type);
                if (type == 1) {
                    jQuery("#textlocation").addClass('hide');
                    jQuery("#selectlocation").val("");
                    jQuery("#selectlocation").removeClass('hide');
                } else if (type == 0) {
                    jQuery("#textlocation").val("");
                    jQuery("#textlocation").removeClass('hide');
                    jQuery("#selectlocation").addClass('hide');
                }
            };

            $scope.searchByMedicine = function (searchkey) {
                $scope.searchkey = searchkey
                alert($scope.searchkey);
                $scope.golink('#/app/inventory/search/' + $scope.searchkey);

            };

            $scope.searchByLocation = function (locid) {
                $scope.searchkey = locid
                alert($scope.searchkey);
                $scope.golink('#/app/inventory/search-location/' + $scope.searchkey);
            };


            /* rightsidetab */
            $scope.intext = 'more';
            $scope.infomore = function (r) {
                jQuery('#' + r).toggleClass('active');
                if (jQuery('#' + r).hasClass('active')) {
                    $scope.intext = 'less'
                } else {
                    $scope.intext = 'more';
                }

            }

            sidetab('#cstab1');
            sidetab('#cstab2');

            $scope.pulltab = function (d) {
                var ww = (jQuery(window).width()) - 40;
                jQuery('#' + d).toggleClass('active');

                if (jQuery('#' + d).hasClass('active')) {
                    jQuery('#' + d).css('transform', 'translate3d(0px, 0px, 0px)')
                } else {
                    jQuery('#' + d).css('transform', 'translate3d(' + ww + 'px, 0px, 0px)')
                }


            }

            /* end of rightsidetab */

        })

        .controller('docjnPatientCtrl', function ($scope, $http, $stateParams, $ionicModal) {

            $ionicModal.fromTemplateUrl('docjn-patient', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
        })

        .controller('docImageoptionCtrl', function ($ionicLoading, $scope, $http, $stateParams, $ionicPopup, $state) {
            $scope.showPopup = function () {
                $scope.data = {};
                // An elaborate, custom popup
                var myPopup = $ionicPopup.show({
                    template: '<div class="row"><div class="col"><div class="button button-positive btn-add bar">File Attachment</div></div></div><div class="row"><div class="col"><div class="button btn-add bar">Camera</div></div></div>',
                    title: 'Upload File',
                    scope: $scope,
                    buttons: [
                        {text: 'Cancel'},
                        {text: '<b>Ok</b>',
                            type: 'button-positive ',
                            onTap: function (e) {
                                if (!$scope.data.wifi) {
                                    //don't allow the user to close unless he enters wifi password
                                    e.preventDefault();
                                } else {
                                    return $scope.data.wifi;
                                }
                            }
                        }
                    ]
                });

                myPopup.then(function (res) {
                    console.log('Tapped!', res);
                });
            };
        })
        /* doctor join  controllers */
        .controller('DjoinpatientCtrl', function ($scope, $http, $stateParams) {
        })
        /* end doctor join  controllers */

        .controller('DoctorChatAppsCtrl', function ($scope, $http, $stateParams, $filter, $ionicPopup, $timeout) {
            $scope.drId = get('id');
            $http({
                method: 'GET',
                url: domain + 'appointment/get-chat-patient-details',
                params: {id: $scope.drId}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.todays_app = response.data.todays_appointments;
                $scope.todays_usersData = response.data.todays_usersData;
                $scope.todays_products = response.data.todays_products;
                $scope.todays_time = response.data.todays_time;
                $scope.week_app = response.data.week_appointments;
                $scope.week_usersData = response.data.week_usersData;
                $scope.week_products = response.data.week_products;
                $scope.week_time = response.data.week_time;
                $scope.all_app = response.data.all_appointments;
                $scope.all_usersData = response.data.all_usersData;
                $scope.all_products = response.data.all_products;
                $scope.all_time = response.data.all_time;
            }, function errorCallback(e) {
                console.log(e);
            });
            $scope.cancelAppointment = function (appId, drId, mode, startTime) {

                $scope.appId = appId;
                $scope.userId = get('id');
                console.log(startTime);
                var curtime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                console.log(curtime);
                var timeDiff = getTimeDiff(startTime, curtime);
                console.log(timeDiff);
                if (timeDiff < 15) {
                    if (mode == 1) {
                        alert("Appointment can not be cancelled now!");
                    } else {
                        //ask 4 options
                        /*$http({
                         method: 'GET',
                         url: domain + 'appointment/dr-cancel-app',
                         params: {appId: $scope.appId, prodId: $scope.prodid, userId: $scope.userId}
                         }).then(function successCallback(response) {
                         console.log(response.data);
                         if (response.data == 'success') {
                         alert('Your appointment is cancelled successfully.');
                         } else {
                         alert('Sorry your appointment is not cancelled.');
                         }
                         $state.go('app.consultations-list');
                         }, function errorCallback(response) {
                         console.log(response);
                         });*/
                    }
                } else {
                    if (mode == 1) {
                        console.log('mode-1');
                        $http({
                            method: 'GET',
                            url: domain + 'appointment/dr-cancel-app',
                            params: {appId: $scope.appId, prodId: $scope.prodid, userId: $scope.userId}
                        }).then(function successCallback(response) {
                            console.log(response.data);
                            if (response.data == 'success') {
                                alert('Your appointment is cancelled successfully.');
                            } else {
                                alert('Sorry your appointment is not cancelled.');
                            }
                            $state.go('app.consultations-list');
                        }, function errorCallback(response) {
                            console.log(response);
                        });
                    } else if (mode == 3 || mode == 4) {
                        console.log('mode-123');
                        //ask for 2 options
                    }
                }
            };
            $scope.showAlert = function () {
                var alertPopup = $ionicPopup.alert({
                    title: 'Alert Box',
                    template: '<ion-checkbox ng-model="filter.snomed1">Snomed1</ion-checkbox><ion-checkbox ng-model="filter.snomed2">Snomed2</ion-checkbox><ion-checkbox ng-model="filter.snomed3">Snomed3</ion-checkbox>'
                });
                alertPopup.then(function (res) {
                    console.log('Thank you for not eating my delicious ice cream cone');
                });
            };
        })

        .controller('CurrentChatCtrl', function ($scope, $http, $stateParams, $filter) {
            $scope.appId = $stateParams.id;
            $scope.drId = get('id');
            $http({
                method: 'GET',
                url: domain + 'appointment/get-patient-current-chat',
                params: {id: $scope.appId, drId: $scope.drId}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.app = response.data.app;
                $scope.user = response.data.userData;
                $scope.products = response.data.products;
                $scope.time = response.data.time;
            }, function errorCallback(e) {
                console.log(e);
            });
        })

        .controller('PeersCtrl', function ($scope, $http, $stateParams) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('PeersDetailCtrl', function ($scope, $http, $stateParams) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('ImagePickerCtrl', function ($scope, $rootScope, $cordovaCamera) {
            $scope.images = [];
            $scope.selImages = function () {
                window.imagePicker.getPictures(
                        function (results) {
                            for (var i = 0; i < results.length; i++) {
                                console.log('Image URI: ' + results[i]);
                                $scope.images.push(results[i]);
                            }
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                        }, function (error) {
                    console.log('Error: ' + error);
                });
            };
            $scope.removeImage = function (image) {
                $scope.images = _.without($scope.images, image);
            };
            $scope.shareImage = function (image) {
                window.plugins.socialsharing.share(null, null, image);
            };
            $scope.shareAll = function () {
                window.plugins.socialsharing.share(null, null, $scope.images);
            };
        })

        .controller('FilterCtrl', function ($scope, $http, $stateParams) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('DiagnosisCtrl', function ($scope, $http, $stateParams) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('TreatmentPlanCtrl', function ($scope, $http, $stateParams) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('SuperviseCtrl', function ($scope, $http, $stateParams) { })

        .controller('TreatmentPlanListCtrl', function ($scope, $http, $stateParams) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })
        ;
