// Ionic Starter App
var domain = "http://stage.doctrs.in/";
//var domain = "http://192.168.2.169/doctors/";
angular.module('underscore', [])
        .factory('_', function () {
            return window._; // assumes underscore has already been loaded on the page
        });

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('your_app_name', [
    'ionic',
    'angularMoment',
    'your_app_name.controllers',
    'your_app_name.directives',
    'your_app_name.filters',
    'your_app_name.services',
    'your_app_name.factories',
    'your_app_name.config',
    'underscore',
    'ngMap',
    'ngResource',
    'ngCordova',
    'slugifier',
    'ionic.contrib.ui.tinderCards',
    'youtube-embed'
])
        .run(function ($ionicPlatform, PushNotificationsService, $rootScope, $ionicConfig, $timeout, $ionicLoading) {
            $ionicPlatform.on("deviceready", function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
                PushNotificationsService.register();
            });
            $rootScope.$on('loading:show', function () {
                $ionicLoading.show({template: 'Loading'})
            })

            $rootScope.$on('loading:hide', function () {
                $ionicLoading.hide()
            })
            // This fixes transitions for transparent background views
            $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                if (toState.name.indexOf('auth.walkthrough') > -1)
                {
                    // set transitions to android to avoid weird visual effect in the walkthrough transitions
                    $timeout(function () {
                        $ionicConfig.views.transition('android');
                        $ionicConfig.views.swipeBackEnabled(false);
                        console.log("setting transition to android and disabling swipe back");
                    }, 0);
                }
            });
            $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
                if (toState.name.indexOf('app.feeds-categories') > -1)
                {
                    // Restore platform default transition. We are just hardcoding android transitions to auth views.
                    $ionicConfig.views.transition('platform');
                    // If it's ios, then enable swipe back again
                    if (ionic.Platform.isIOS())
                    {
                        $ionicConfig.views.swipeBackEnabled(true);
                    }
                    console.log("enabling swipe back and restoring transition to platform default", $ionicConfig.views.transition());
                }
            });

            $ionicPlatform.on("resume", function () {
                PushNotificationsService.register();
            });
        })


        .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
            $httpProvider.interceptors.push(function ($rootScope) {
                return {
                    request: function (config) {
                        $rootScope.$broadcast('loading:show')
                        return config
                    },
                    response: function (response) {
                        $rootScope.$broadcast('loading:hide')
                        return response
                    }
                }
            })

            $stateProvider
                    //INTRO
                    .state('auth', {
                        url: "/auth",
                        templateUrl: "views/auth/auth.html",
                        abstract: true,
                        controller: 'AuthCtrl'
                    })

                    .state('auth.walkthrough', {
                        url: '/walkthrough',
                        templateUrl: "views/auth/walkthrough.html"
                    })

                    .state('auth.login', {
                        url: '/login',
                        templateUrl: "views/auth/login.html",
                        controller: 'LoginCtrl'
                    })

                    .state('auth.signup', {
                        url: '/signup',
                        templateUrl: "views/auth/signup.html",
                        controller: 'SignupCtrl'
                    })

                    .state('auth.forgot-password', {
                        url: "/forgot-password",
                        templateUrl: "views/auth/forgot-password.html",
                        controller: 'ForgotPasswordCtrl'
                    })

                    .state('app', {
                        url: "/app",
                        abstract: true,
                        templateUrl: "views/app/side-menu.html",
                        controller: 'AppCtrl'
                    })

                    .state('app.doctor-settings', {
                        cache: false,
                        url: "/doctor-settings",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/doctor-settings.html",
                                controller: 'DoctorSettingsCtrl'
                            }
                        }
                    })

                    /* doctor join */
                    .state('dpatient', {
                        url: "/dpatient",
                        templateUrl: "views/app/doctrjoin/dpatient.html",
                        controller: 'PatientHistoryCtrl'
                    })

                    .state('dfamily-history', {
                        url: "/dfamily-history",
                        templateUrl: "views/app/doctrjoin/dfamily-history.html",
                        controller: 'ConsultationsNoteCtrl'
                    })

                    .state('dmeasurement', {
                        url: "/dmeasurement",
                        templateUrl: "views/app/doctrjoin/dmeasurement.html",
                        controller: 'ConsultationsNoteCtrl'
                    })

                    .state('dtestresult', {
                        url: "/dtestresult",
                        templateUrl: "views/app/doctrjoin/dtestresult.html",
                        controller: 'ConsultationsNoteCtrl'
                    })

                    .state('dobservation', {
                        url: "/dobservation",
                        templateUrl: "views/app/doctrjoin/dobservation.html",
                        controller: 'ConsultationsNoteCtrl'
                    })

                    .state('dsnomed', {
                        url: "/dsnomed",
                        templateUrl: "views/app/doctrjoin/dsnomed.html",
                        controller: 'ConsultationsNoteCtrl'
                    })

                    .state('dicd', {
                        url: "/dsnomed",
                        templateUrl: "views/app/doctrjoin/dicd.html",
                        controller: 'ConsultationsNoteCtrl'
                    })


                    .state('dtext', {
                        url: "/dtext",
                        templateUrl: "views/app/doctrjoin/dtext.html",
                        controller: 'ConsultationsNoteCtrl'
                    })
                    .state('dinvestigations', {
                        url: "/dinvestigations",
                        templateUrl: "views/app/doctrjoin/dinvestigations.html",
                        controller: 'ConsultationsNoteCtrl'
                    })

                    .state('dmedication', {
                        url: "/dmedication",
                        templateUrl: "views/app/doctrjoin/dmedication.html",
                        controller: 'ConsultationsNoteCtrl'
                    })

                    .state('dprocedure', {
                        url: "/dprocedure",
                        templateUrl: "views/app/doctrjoin/dprocedure.html",
                        controller: 'ConsultationsNoteCtrl'
                    })

                    .state('dlifestyle', {
                        url: "/dlifestyle",
                        templateUrl: "views/app/doctrjoin/dlifestyle.html",
                        controller: 'ConsultationsNoteCtrl'
                    })

                    .state('dreferral', {
                        url: "/dreferral",
                        templateUrl: "views/app/doctrjoin/dreferral.html",
                        controller: 'ConsultationsNoteCtrl'
                    })


                    .state('ddietplan', {
                        url: "/ddietplan",
                        templateUrl: "views/app/doctrjoin/ddietplan.html",
                        controller: 'DietplanCtrl'
                    })

                    .state('ddietplan-list', {
                        url: "/ddietplan-list",
                        templateUrl: "views/app/doctrjoin/ddietplan-list.html",
                        controller: 'DietplanListCtrl'
                    })


                    /* doctor join */
                    .state('app.doctor-consultations', {
                        cache: false,
                        url: "/doctor-consultations",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/doctor-consultations.html",
                                controller: 'DoctorConsultationsCtrl'
                            }
                        }
                    })

                    .state('app.consultation-past', {
                        url: "/consultations/past",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultations-past.html",
                                controller: 'DoctorConsultationsCtrl'
                            }
                        }
                    })
                    .state('app.patient-app-list', {
                        cache: false,
                        url: "/patient-app-list/{id:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/patients/patient-app-list.html",
                                controller: 'PatientAppointmentListCtrl'
                            }
                        }
                    })
                    .state('app.patient-past-app-list', {
                        cache: false,
                        url: "/patient-past-app-list/{id:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/patients/patient-past-app-list.html",
                                controller: 'PatientAppointmentListCtrl'
                            }
                        }
                    })


                    .state('app.chat', {
                        url: "/chat/{id:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/chat.html",
                                controller: 'ChatCtrl'
                            }
                        }
                    })

                    .state('app.chatlist', {
                        url: "/chatlist",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/chatlist.html",
                                controller: 'ChatListCtrl'
                            }
                        }
                    })

                    .state('app.past-chatlist', {
                        url: "/past-chatlist",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/past-chatlist.html",
                                controller: 'PastChatListCtrl'
                            }
                        }
                    })

                    .state('app.assistantChatList', {
                        url: "/assistantChatList",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/assistant-chatlist.html",
                                controller: 'AssistantChatListCtrl'
                            }
                        }
                    })

                    .state('app.peers', {
                        url: "/peers",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/peers.html",
                                controller: 'PeersCtrl'
                            }
                        }
                    })

                    .state('app.peers-detail', {
                        url: "/peers-detail",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/peers-detail.html",
                                controller: 'PeersDetailCtrl'
                            }
                        }
                    })



                    .state('app.chat-appointments', {
                        cache: false,
                        url: "/chat-appointments",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/chat-appointments.html",
                                controller: 'DoctorChatAppsCtrl'
                            }
                        }
                    })

                    .state('app.view-note', {
                        url: "/view-note/{id:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/view-consultations-note.html",
                                controller: 'ViewConsultationsNoteCtrl'
                            }
                        }
                    })

                    .state('app.view-patient-history', {
                        cache: false,
                        url: "/consultation-note/view-patient-history/{id:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/view-patient-history.html",
                                controller: 'ViewPatientHistoryCtrl'
                            }
                        }
                    })

                    .state('app.view-medicine', {
                        cache: false,
                        url: "/view-medicine/{id:string}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/view-medicine.html",
                                controller: 'ViewMedicineCtrl'
                            }
                        }
                    })

                    .state('app.consultations-note', {
                        url: "/consultations-note/{appId:string}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultations-note.html",
                                controller: 'ConsultationsNoteCtrl'
                            }
                        }
                    })

                    /* inventory */
                    .state('app.inventory', {
                        cache: false,
                        url: "/inventory",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/inventory/inventory.html",
                                controller: 'InventoryCtrl'
                            }
                        }
                    })
                    .state('app.searchinventory', {
                        cache: false,
                        url: "/inventory/search/{key:string}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/inventory/search.html",
                                controller: 'InventorySearchCtrl'
                            }
                        }
                    })

                    .state('app.search-location', {
                        cache: false,
                        url: "/inventory/search-location/{key:string}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/inventory/search-location.html",
                                controller: 'InventorySearchCtrl'
                            }
                        }
                    })

                    .state('inventory-location', {
                        url: "/inventory-location/{key:string}",
                        templateUrl: "views/app/doctrjoin/inventory-location.html",
                        controller: 'InveLocationCtrl'
                    })

                    .state('inventory-search', {
                        url: "/inventory-search/{key:string}",
                        templateUrl: "views/app/doctrjoin/inventory-search.html",
                        controller: 'InveSearchCtrl'


                    })



                    .state('app.about', {
                        url: "/consultation-note/about",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/about.html",
                                controller: 'ConsultationsNoteCtrl'
                            }
                        }
                    })

                    .state('app.patient-history', {
                        url: "/consultation-note/patient-history",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/patient-history.html",
                                controller: 'PatientHistoryCtrl'
                            }
                        }
                    })

                    .state('app.family-history', {
                        url: "/consultation-note/family-history",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/family-history.html",
                                controller: 'ConsultationsNoteCtrl'
                            }
                        }
                    })

                    .state('app.measurement', {
                        url: "/consultation-note/measurement",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/measurement.html",
                                controller: 'MeasurementCtrl'
                            }
                        }
                    })
                    .state('app.observation', {
                        url: "/consultation-note/observation",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/observation.html",
                                controller: 'ObservationCtrl'
                            }
                        }
                    })
                    .state('app.diagnosis', {
                        url: "/consultation-note/diagnosis",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/diagnosis.html",
                                controller: 'DiagnosisTextCtrl'
                            }
                        }
                    })

                    .state('app.testresult', {
                        url: "/consultation-note/testresult",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/testresult.html",
                                controller: 'ConsultationsNoteCtrl'
                            }
                        }
                    })
                    .state('app.investigations', {
                        url: "/consultation-note/investigations",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/investigations.html",
                                controller: 'ConsultationsNoteCtrl'
                            }
                        }
                    })

                    .state('app.newarticle', {
                        url: "/newarticle",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/newarticle.html",
                                controller: 'NewarticleCtrl'
                            }
                        }
                    })

                    .state('app.medication', {
                        url: "/consultation-note/medication",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/medication.html",
                                controller: 'ConsultationsNoteCtrl'
                            }
                        }
                    })

                    .state('app.procedure', {
                        url: "/consultation-note/procedure",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/consultation-note/procedure.html",
                                controller: 'ConsultationsNoteCtrl'
                            }
                        }
                    })

                    .state('app.evaluation', {
                        url: "/evaluation",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/evaluation.html",
                                controller: 'EvaluationCtrl'
                            }
                        }
                    })

//                    .state('app.diagnosis', {
//                        url: "/diagnosis",
//                        views: {
//                            'menuContent': {
//                                templateUrl: "views/app/diagnosis.html",
//                                controller: 'DiagnosisCtrl'
//                            }
//                        }
//                    })

                    .state('app.treatment-plan', {
                        url: "/treatmentplan",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/treatment-plan.html",
                                controller: 'TreatmentPlanCtrl'
                            }
                        }
                    })

                    .state('app.createdbyu', {
                        url: "/createdbyu/{id:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/createdbyu.html",
                                controller: 'CreatedbyuCtrl'
                            }
                        }
                    })

                    .state('app.records-view', {
                        cache: false,
                        url: "/records-view/{id:int}/{patientId:int}/{shared:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/records/records-view.html",
                                controller: 'RecordsViewCtrl'
                            }
                        }
                    })

                    .state('app.record-details', {
                        cache: false,
                        url: "/record-details/{id:int}/{patientId:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/records/record-details.html",
                                controller: 'RecordDetailsCtrl'
                            }
                        }
                    })

                    .state('app.sharedwithu', {
                        cache: false,
                        url: "/sharedwithu/{id:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/sharedwithu.html",
                                controller: 'SharedwithuCtrl'
                            }
                        }
                    })


                    .state('app.treatment-plan-list', {
                        url: "/treatmentplan-list",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/treatment-plan-list.html",
                                controller: 'TreatmentPlanListCtrl'
                            }
                        }
                    })

                    .state('app.doctor-current-tab', {
                        url: "/doctor-current-tab/{id:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/doctor-current-tab.html",
                                controller: 'DoctorCurrentTabCtrl'
                            }
                        }
                    })

                    .state('app.doctor-join', {
                        cache: false,
                        url: "/doctor-join/{id:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/doctor-join.html",
                                controller: 'DoctorJoinCtrl'
                            }
                        }
                    })
                    .state('app.current-chat', {
                        cache: false,
                        url: "/current-chat/{id:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/current-chat.html",
                                controller: 'CurrentChatCtrl'
                            }
                        }
                    })
                    .state('app.join-chat', {
                        url: "/join-chat/{id:int}/{mode:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/join-chat.html",
                                controller: 'JoinChatCtrl'
                            }
                        }
                    })

                    .state('app.patient-chat', {
                        url: "/patient-chat",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/patient-chat.html",
                                controller: 'PatientChatCtrl'
                            }
                        }
                    })


                    .state('app.homepage', {
                        cache: false,
                        url: "/homepage",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/homepage.html",
                                controller: 'HomepageCtrl'
                            }
                        }
                    })

                    .state('app.patient-list', {
                        url: "/patient-list",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/patient-list.html",
                                controller: 'PatientListCtrl'
                            }
                        }
                    })

                    .state('app.patient', {
                        url: "/patient/{id:int}",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/patient.html",
                                controller: 'PatientCtrl'
                            }
                        }
                    })

                    .state('app.content-library', {
                        //  cache: false,
                        url: "/content-library",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/content-library/content-library.html",
                                controller: 'ContentLibraryCtrl'
                            }
                        }
                    })

                    .state('app.library-feed', {
                        //  cache: false,
                        url: "/library-feed",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/content-library/library-feed.html",
                                controller: 'LibraryFeedCtrl'
                            }
                        }
                    })

                    .state('app.content-library-list', {
                        //  cache: false,
                        url: "/content-library-list",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/content-library/content-library-list.html",
                                controller: 'ContentLibraryListCtrl'
                            }
                        }
                    })

                    .state('app.content-library-details', {
                        //  cache: false,
                        url: "/content-library-details.html",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/content-library/content-library-details.html",
                                controller: 'ContentLibraryDetailsCtrl'
                            }
                        }
                    })

                    .state('app.dietplan', {
                        //  cache: false,
                        url: "/dietplan",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/dietplan.html",
                                controller: 'DietplanCtrl'
                            }
                        }
                    })

                    .state('app.dietplan-list', {
                        //  cache: false,
                        url: "/dietplan-list",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/dietplan-list.html",
                                controller: 'DietplanListCtrl'
                            }
                        }
                    })


                    .state('app.patient-record', {
                        url: "/patient-record",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/patient-record.html",
                                controller: 'PatientRecordCtrl'
                            }
                        }
                    })

                    .state('app.patient-consult', {
                        url: "/patient-consult",
                        views: {
                            'menuContent': {
                                templateUrl: "views/app/patient-consult.html",
                                controller: 'PatientConsultCtrl'
                            }
                        }
                    })

                    .state('app.logout', {
                        url: "/logout",
                        views: {
                            'menuContent': {
                                //templateUrl: "views/app/bookmarks.html",
                                controller: 'AppCtrl'
                            }
                        }
                    })
                    ;
            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/auth/walkthrough');
        });
