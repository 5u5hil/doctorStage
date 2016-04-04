var publisher;
var session;
var subscriber;
angular.module('your_app_name.controllers', [])

        .controller('AuthCtrl', function ($scope, $state, $ionicConfig, $rootScope) {
            if (window.localStorage.getItem('id') != null) {
                $rootScope.userLogged = 1;
                $rootScope.username = window.localStorage.getItem('fname');
                $rootScope.userimage = window.localStorage.getItem('image');
            }
            // else {
            // if ($rootScope.userLogged == 0)
            // $state.go('auth.login');
            // }
        })

// APP
        .controller('AppCtrl', function ($scope, $http, $state, $ionicConfig, $rootScope, $ionicLoading, $timeout, $ionicHistory) {
            $rootScope.imgpath = domain + "/public/frontend/user/";
            $rootScope.attachpath = domain + "/public";
            if (window.localStorage.getItem('id') != null) {
                $rootScope.userLogged = 1;
                $rootScope.username = window.localStorage.getItem('fname');
                $rootScope.userimage = window.localStorage.getItem('image');
            }
            // else {
            // if ($rootScope.userLogged == 0)
            // $state.go('auth.login');
            // }
            $scope.logout = function () {
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
        .controller('LoginCtrl', function ($scope, $state, $templateCache, $q, $rootScope, $ionicLoading, $timeout) {
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
                        //  console.log("@@@@"+response.fname);
                        if (angular.isObject(response)) {
                            $scope.loginError = '';
                            $scope.loginError.digest;
                            store(response);
                            $rootScope.userLogged = 1;
                            $rootScope.username = response.fname;
                            $rootScope.userimage = response.image;
                            $ionicLoading.hide();
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
            $scope.docId = '';
            $scope.userId = get('id');
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
                                    $state.go('app.createdbyu', {id: $scope.patientId}, {reload: true});
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

        .controller('RecordsViewCtrl', function ($scope, $http, $state, $stateParams, $rootScope, $cordovaPrinter, $ionicModal, $timeout) {
            $scope.interface = window.localStorage.getItem('interface_id');
            $scope.category = [];
            $scope.catId = $stateParams.id;
            $scope.patientId = $stateParams.patientId;
            $scope.shared = $stateParams.shared;
            $scope.limit = 3;
            $scope.recId = [];
            $scope.recIds = [];
            $scope.userId = get('id');
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
                                params: {ids: JSON.stringify($scope.recIds), userId: $scope.userId, docId: $scope.docId, shared: $scope.shared}
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
            $scope.userId = get('id');
            $scope.shared = $stateParams.shared;
            $scope.patientId = $stateParams.patientId;
            $scope.interface = window.localStorage.getItem('interface_id');
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
                            params: {id: $scope.recordId, userId: $scope.userId, docId: $scope.docId, shared: $scope.shared}
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
                alert($scope.searchkey);

                $state.go('app.searchinventory', {'key': $scope.searchkey}, {reload: true});

            };

            $scope.searchByLocation = function (locid) {
                $scope.searchkey = locid
                alert($scope.searchkey);

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



        .controller('DoctrslistsCtrl', function ($scope, $http, $stateParams, $ionicModal) {
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

        .controller('ContentLibraryCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
            $ionicModal.fromTemplateUrl('create-library', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            };
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

        .controller('DoctorSettingsCtrl', function ($scope, $http, $stateParams, $ionicModal, $ionicLoading, $state) {
            $http({
                method: 'GET',
                url: domain + 'doctors/get-doctor-setting',
                params: {docId: window.localStorage.getItem('id')}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.instant_permission = response.data.schedule;
                $scope.instant_status = response.data.status;
                $scope.status = $scope.instant_status.presence;
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
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-patient-details',
                params: {userId: $scope.userId, patientId: $scope.patientId}
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.dob = response.data.dob;
                $scope.recordsCreatedCnt = response.data.recordsCreatedCnt;
                $scope.recordsSharedCnt = response.data.recordsSharedCnt;
                $scope.activeAppCnt = response.data.activeAppCnt;
                $scope.pastAppCnt = response.data.pastAppCnt;
                $scope.patientDetails = response.data.patientDetails;
            }, function errorCallback(e) {
                console.log(e);
            });
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
                $state.go("app.consultations-note", {'appId': appId}, {reload: true});
            };
            //Go to consultation view page
            $scope.viewNote = function (noteId) {
                //alert(appId);
                store({'noteId': noteId});
                $state.go("app.view-note", {'id': noteId}, {reload: true});
            };
        })

        .controller('EvaluationCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('MyCtrl', function ($scope, $ionicTabsDelegate) {
            $scope.selectTabWithIndex = function (index) {
                $ionicTabsDelegate.select(index);
            }
        })

        .controller('HomepageCtrl', function ($scope, $http, $stateParams, $ionicModal, $rootScope) {
            $rootScope.measurement = "";
            $rootScope.objText = "";
            $rootScope.diaText = "";
            $rootScope.objId = "";
            $rootScope.diaId = "";
            window.localStorage.removeItem('patientId');
            window.localStorage.removeItem('drId');
            window.localStorage.removeItem('doctorId');
        })

        .controller('PatientRecordCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })


        .controller('PatientConsultCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })

        .controller('NewarticleCtrl', function ($scope, $http, $stateParams, $ionicModal) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
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

        .controller('noteType', function ($scope, $ionicModal, $state) {
            $scope.check = function (pid, did) {
                console.log("Patient = " + pid + " dr Id = " + did);
                if (pid == '' && did == '') {
                    alert("Please select doctor and patient.");
                } else if (pid == '') {
                    alert("Please select patient.");
                } else if (did == '') {
                    alert("Please select doctor.");
                } else {
                    $scope.modal.show();
                }
            };
            $ionicModal.fromTemplateUrl('notetype', {
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

        .controller('ConsultationsNoteCtrl', function ($scope, $http, $stateParams, $rootScope, $state, $compile, $ionicModal, $timeout, $filter, $cordovaCamera, $ionicLoading) {
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
                    params: {patient: $scope.patientId, userId: $scope.userId, catId: $scope.catId}
                }).then(function successCallback(response) {
                    console.log(response.data);
                    $scope.record = response.data.record;
                    $scope.fields = response.data.fields;
                    $scope.problems = response.data.problems;
                    $scope.doctrs = response.data.doctrs;
                    $scope.patients = response.data.patients;
                    $scope.cases = response.data.cases;
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

            $ionicModal.fromTemplateUrl('selectpatient', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.submitmodal = function () {
                $scope.modal.hide();
            }
            ;
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
                $ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addPatientForm")[0]);
                callAjax("POST", domain + "doctrsrecords/save-patient-history", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (angular.isObject(response.records)) {
                        alert("Patient History saved successfully!");
                        $state.go('app.consultations-note', {'appId': $scope.appId}, {}, {reload: true});
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
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.catId = 'Measurements';
            $http({
                method: 'GET',
                url: domain + 'doctrsrecords/get-measure-fields',
                params: {patient: $scope.patientId, userId: $scope.userId, doctor: $scope.doctorId, catId: $scope.catId}
            }).then(function successCallback(response) {
                console.log(response);
                $scope.records = response.data.record;
                $scope.fields = response.data.fields;
            }, function errorCallback(response) {
                console.log(response);
            });
            $scope.saveMeasurements = function () {
                //$ionicLoading.show({template: 'Adding...'});
                var data = new FormData(jQuery("#addMeasureForm")[0]);
                callAjax("POST", domain + "doctrsrecords/save-measurements", data, function (response) {
                    console.log(response);
                    $ionicLoading.hide();
                    if (angular.isObject(response.records)) {
                        alert("Measurements saved successfully!");
                        $rootScope.measurement = response.records.id;
                        $state.go('app.consultations-note', {'appId': $scope.appId}, {reload: true});
                    } else if (response.err != '') {
                        alert('Please fill mandatory fields');
                    }
                });
            };
        })

        .controller('ObservationCtrl', function ($scope, $http, $stateParams, $state, $rootScope, $ionicModal, $timeout, $filter, $cordovaCamera, $ionicLoading) {
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.objText = [];
            $scope.selConditions = [];
            $scope.observation = '';

            $ionicModal.fromTemplateUrl('addeval', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.showM = function () {
                    $scope.observation = '';
                    $scope.modal.show();
                };
            });
            $scope.submitmodal = function (observation) {
                alert(observation);
                $scope.objText.push({'objtext': observation});
                $rootScope.objText = $scope.objText;
                $scope.observation = '';
                $scope.modal.hide();
            };

            $scope.saveObj = function () {
                console.log($scope.objText);
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/save-observations',
                    params: {patient: $scope.patientId, userId: $scope.userId, objType: 'Text', doctor: $scope.doctorId, catId: $scope.catId, objText: JSON.stringify($scope.objText)}
                }).then(function successCallback(response) {
                    if (angular.isObject(response.data.records)) {
                        $rootScope.objId = response.data.records.id;
                        alert("Observations added succesesfully!");
                        $state.go('app.consultations-note', {'appId': $scope.appId}, {reload: true});
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
                    $scope.observation = $rootScope.objText[ind].objtext;
                    $scope.modal.show();
                };
            });
            $scope.submitmodal = function (observation) {
                $rootScope.objText[$scope.ind].objtext = observation;
                console.log($rootScope.objText);
                $scope.modal.hide();
            };
        })

        .controller('DiagnosisTextCtrl', function ($scope, $ionicModal, $rootScope, $http, $state) {
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.patientId = window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.diaText = {};
            $scope.diaText.diagnosis = '';
            $scope.saveDiagnosis = function (data) {
                $http({
                    method: 'GET',
                    url: domain + 'doctrsrecords/save-diagnosis',
                    params: {patient: $scope.patientId, userId: $scope.userId, diaType: 'Text', doctor: $scope.doctorId, catId: $scope.catId, diaText: $scope.diaText.diagnosis}
                }).then(function successCallback(response) {
                    if (angular.isObject(response.data.records)) {
                        console.log(response.data.records.id);
                        $rootScope.diaId = response.data.records.id;
                        alert("Diagnosis added succesesfully!");
                        //$scope.modal.hide();
                        $state.go('app.consultations-note', {'appId': $scope.appId}, {reload: true});
                    }
                }, function errorCallback(e) {
                    console.log(e);
                });
            };
//            $ionicModal.fromTemplateUrl('addeval', {
//                scope: $scope
//            }).then(function (modal) {
//                $scope.modal = modal;
//            });
//            $scope.submitmodal = function (data) {
//                console.log(data.diagnosis);
//                //$scope.modal.hide();
//            };
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

        })
        
        .controller('ViewPatientHistoryCtrl', function ($scope, $http, $stateParams, $rootScope, $state, $sce, $ionicModal, $timeout, $filter, $cordovaCamera, $ionicLoading) {
//            $scope.noteId = $stateParams.id;
//            $scope.userId = window.localStorage.getItem('id');
//            $scope.record = {};
//            $scope.recordDetails = {};
//            $scope.problems = {};
//            $scope.doctrs = {};
//            $scope.patients = {};
//            $scope.cases = {};
//            $http({
//                method: 'GET',
//                url: domain + 'assistrecords/get-patient-history-details',
//                params: {noteId: $scope.noteId, userId: $scope.userId, interface: $scope.interface}
//            }).then(function successCallback(response) {
//                console.log(response.data);
//                $scope.record = response.data.record;
//                $scope.recordDetails = response.data.recordsDetails;
//                $scope.problems = response.data.problem;
//                $scope.doctrs = response.data.doctrs;
//                $scope.patients = response.data.patient;
//                $scope.cases = response.data.caseData;
//                console.log($scope.recordDetails);
//            }, function errorCallback(response) {
//                console.log(response);
//            });

            $scope.patientId = $stateParams.id; //window.localStorage.getItem('patientId');
            $scope.appId = window.localStorage.getItem('appId');
            $scope.catId = 'Patient History';
            $scope.conId = [];
            $scope.conIds = [];
            $scope.selConditions = [];
            $scope.gend = '';
            $scope.gender = '';
            $scope.userId = window.localStorage.getItem('id');
            $scope.doctorId = window.localStorage.getItem('doctorId'); //$stateParams.drId
            $scope.curTime = new Date();
            $scope.curTimeo = $filter('date')(new Date(), 'hh:mm a');
            $http({
                method: 'GET',
                url: domain + 'assistrecords/get-about-fields',
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
                            } else $scope.gender = 'Na';
                        }
                    });
                } else {
                    if (response.data.patients[0].gender == 1) {
                        $scope.gender = 'Male';
                    } else if (response.data.patients[0].gender == 2) {
                        $scope.gender = 'Female';
                    } else $scope.gender = 'Na';
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
            $scope.cancelAppointment = function (appId, drId, mode, startTime) {
                $scope.appId = appId;
                $scope.userId = get('id');
                $scope.cancel = '';
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
                    } else if (mode == 3 || mode == 4) {
                        //ask for 2 options
                    }
                }
            };
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
                $state.go("app.consultations-note", {'appId': appId}, {reload: true});
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
            $ionicModal.fromTemplateUrl('viewmoreprofile', {
                scope: $scope
            }).then(function (modal) {
                $scope.canceldctr = modal;
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
                console.log(timeDiff);
                if (timeDiff < 15) {
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
            }, function errorCallback(e) {
                console.log(e);
            });
            $scope.cancelAppointment = function (appId, drId, mode, startTime) {
                console.log(mode);
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
                        console.log('dddd');
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
                        console.log('fasd');
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
                                $state.go('app.doctor-consultations', {}, {reload: true});
                            }
                            $state.go('app.consultations-list');
                        }, function errorCallback(response) {
                            console.log(response);
                        });
                    } else if (mode == 3 || mode == 4) {

                        //ask for 4 options
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

        .controller('ChatListCtrl', function ($scope, $http, $stateParams, $rootScope, $filter) {
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.participant = [];
            $scope.msg = [];
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
                        console.log(responseData);
                        $scope.participant[key] = responseData.data.user;
                        $scope.msg[key] = responseData.data.msg;
                        $rootScope.$digest;
                    }, function errorCallback(response) {
                        console.log(response.responseText);
                    });
                });
            }, function errorCallback(e) {
                console.log(e);
            });








        })

        .controller('PastChatListCtrl', function ($scope, $http, $stateParams, $rootScope, $filter) {
            $scope.doctorId = window.localStorage.getItem('id');
            $scope.participant = [];
            $scope.msg = [];
            $http({
                method: 'GET',
                url: domain + 'doctorsapp/get-past-chats',
                params: {drid: $scope.doctorId}
            }).then(function sucessCallback(response) {
                console.log(response.data);
                $scope.chatParticipants = response.data;
                angular.forEach($scope.chatParticipants, function (value, key) {
                    $http({
                        method: 'GET',
                        url: domain + 'doctorsapp/get-chat-msg',
                        params: {partId: value[0].participant_id, chatId: value[0].chat_id}
                    }).then(function successCallback(responseData) {
                        console.log(responseData);
                        $scope.participant[key] = responseData.data.user;
                        $scope.msg[key] = responseData.data.msg;
                        $rootScope.$digest;
                    }, function errorCallback(response) {
                        console.log(response.responseText);
                    });
                });
            }, function errorCallback(e) {
                console.log(e);
            });
        })

        .controller('ChatCtrl', function ($scope, $http, $stateParams, $timeout, $filter) {
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
            alert($scope.searchkey);
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
            $http({
                method: 'GET',
                url: domain + 'appointment/join-patient',
                params: {id: $scope.appId, userId: $scope.userId}
            }).then(function sucessCallback(response) {
                //console.log(response.data);
                $scope.user = response.data.user;
                $scope.app = response.data.app;
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
                        jQuery("#subscribersDiv").html("Patient Left the Consultation");
                    },
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
                        publisher = OT.initPublisher('myPublisherDiv', {width: "30%", height: "30%"});
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

            if (!get('loadedOnce')) {
                store({'loadedOnce': 'true'});
                $window.location.reload(true);
                // don't reload page, but clear localStorage value so it'll get reloaded next time

            } else {
                // set the flag and reload the page
                window.localStorage.removeItem('loadedOnce');
            }

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
            $scope.removeCamFile = function (img) {
                var arrInd = (img - 1);
                var index = $scope.tempImgs.indexOf(arrInd);
                $scope.tempImgs.splice(index, 1);
                console.log('camera file removed');
                console.log($scope.tempImgs);
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
                    publisher.destroy();
                    subscriber.destroy();
                    session.unsubscribe();
                    session.disconnect();
                    $ionicHistory.nextViewOptions({
                        historyRoot: true
                    })
                    $state.go('app.doctor-consultations', {}, {reload: true});
                } catch (err) {
                    $ionicHistory.nextViewOptions({
                        historyRoot: true
                    })
                    $state.go('app.doctor-consultations', {}, {reload: true});
                }
            };

            $scope.addnote = function () {
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
                alert($scope.searchkey);
                $scope.golink('#/app/inventory/search/' + $scope.searchkey);

            };

            $scope.searchByLocation = function (locid) {
                $scope.searchkey = locid
                alert($scope.searchkey);
                $scope.golink('#/app/inventory/search-location/' + $scope.searchkey);

            };

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

//        .controller('JoinChatCtrl', function ($scope, $http, $stateParams, $sce, $filter) {
//            $scope.curTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
//            $scope.appId = $stateParams.id;
//            $scope.mode = $stateParams.mode;
//            $scope.userId = get('id');
//            $scope.msgs = {};
//            $http({
//                method: 'GET',
//                url: domain + 'chat/doctor-join-chat',
//                params: {id: $scope.appId, userId: $scope.userId, mode: $scope.mode}
//            }).then(function sucessCallback(response) {
//                console.log(response.data);
//                $scope.user = response.data.user;
//                $scope.app = response.data.app;
//                $scope.msgs = response.data.chat;
//                //$scope.oToken = "https://test.doctrs.in/opentok/opentok?session=" + response.data.app[0].appointments.opentok_session_id;
//                var apiKey = '45121182';
//                var sessionId = response.data.app[0].appointments.opentok_session_id;
//                var token = response.data.oToken;
//                var session = OT.initSession(apiKey, sessionId);
//                session.connect(token, function (error) {
//                    if (error) {
//                        console.log("Error connecting: ", error.code, error.message);
//                    } else {
//                        console.log("Connected to the session.");
//                    }
//                });
//                session.on("signal", function (event) {
//                    console.log("Signal sent from connection " + event.from.id);
//                    $('#subscribersDiv').append(event.data);
//                });
//                $scope.send = function () {
//                    session.signal({data: jQuery("[name='msg']").val()},
//                            function (error) {
//                                if (error) {
//                                    console.log("signal error ("
//                                            + error.code
//                                            + "): " + error.message);
//                                } else {
//                                    var msg = jQuery("[name='msg']").val();
//                                    $http({
//                                        method: 'GET',
//                                        url: domain + 'chat/add-patient-chat',
//                                        params: {from: $scope.userId, to: $scope.user[0].id, msg: msg}
//                                    }).then(function sucessCallback(response) {
//                                        console.log(response);
//                                        jQuery("[name='msg']").val('');
//                                    }, function errorCallback(e) {
//                                        console.log(e.responseText);
//                                    });
//                                    console.log("signal sent.");
//                                }
//                            }
//                    );
//                };
//            }, function errorCallback(e) {
//                console.log(e.responseText);
//            });
//        })

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

		.controller('SuperviseCtrl', function ($scope, $http, $stateParams) {
            
        })
		
		
		
		
		

        .controller('TreatmentPlanListCtrl', function ($scope, $http, $stateParams) {
            $scope.category_sources = [];
            $scope.categoryId = $stateParams.categoryId;
        })
        ;
