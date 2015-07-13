angular.module('containers', [])
    .controller('ContainersController', ['$scope', 'Container', 'Settings', 'Messages', 'ViewSpinner',
        function ($scope, Container, Settings, Messages, ViewSpinner) {
            $scope.predicate = '-Created';
            $scope.toggle = false;
            $scope.displayAll = Settings.displayAll;

            var update = function (data) {
                ViewSpinner.spin();
                Container.query(data, function (d) {
                    $scope.containers = d.map(function (item) {
                        //console.log(item);
                        return new ContainerViewModel(item);
                    });
                    ViewSpinner.stop();
                });
            };

            var executeAction = function( cID, action, msg) {

                var c;

                angular.forEach($scope.containers, function (item) {

                    if (item.Id === cID) {
                        c = item;
                        return;
                    }
                });

                ViewSpinner.spin();
                var counter = 0;

                var complete = function () {
                    counter = counter - 1;
                    if (counter === 0) {
                        ViewSpinner.stop();
                        update({all: Settings.displayAll ? 1 : 0});
                    }

                    ViewSpinner.stop();
                };

                if (action === Container.start) {
                    Container.get({id: c.Id}, function (d) {
                        c = d;
                        counter = counter + 1;
                        action({id: c.Id, HostConfig: c.HostConfig || {}}, function (d) {
                            Messages.send("Container " + msg, c.Id);
                            var index = $scope.containers.indexOf(c);
                            complete();
                        }, function (e) {
                            Messages.error("Failure", e.data);
                            complete();
                        });
                    }, function (e) {
                        if (e.status === 404) {
                            $('.detail').hide();
                            Messages.error("Not found", "Container not found.");
                        } else {
                            Messages.error("Failure", e.data);
                        }
                        complete();
                    });
                }
                else {
                    counter = counter + 1;
                    action({id: c.Id}, function (d) {
                        Messages.send("Container " + msg, c.Id);
                        var index = $scope.containers.indexOf(c);
                        complete();
                    }, function (e) {
                        Messages.error("Failure", e.data);
                        complete();
                    });

                }


                return counter;
            };

            var batch = function (items, action, msg) {

                angular.forEach(items, function (c) {
                    if (c.Checked) {
                        executeAction(c.Id, action, msg);
                    }
                });
            };

            $scope.toggleSelectAll = function () {
                angular.forEach($scope.containers, function (i) {
                    i.Checked = $scope.toggle;
                });
            };

            $scope.toggleGetAll = function () {
                Settings.displayAll = $scope.displayAll;
                update({all: Settings.displayAll ? 1 : 0});
            };

            $scope.startAction = function ( containerId) {

                executeAction( containerId, Container.start, "Started");
            };

            $scope.startSelectedAction = function () {

                batch($scope.containers, Container.start, "Started");
            };

            $scope.stopAction = function (containerId) {

                executeAction(containerId, Container.stop, "Stopped");
            };

            $scope.stopSelectedAction = function () {

                batch($scope.containers, Container.stop, "Stopped");
            };

            $scope.restartAction = function (containerId) {

                executeAction(containerId,Container.restart, "Restarted");
            };

            $scope.restartSelectedAction = function () {

                batch($scope.containers, Container.restart, "Restarted");
            };

            $scope.killAction = function (containerId) {

                executeAction(containerId, Container.kill, "Killed");
            };

            $scope.killSelectedAction = function () {

                batch($scope.containers, Container.kill, "Killed");
            };

            $scope.pauseAction = function (containerId) {

                executeAction(containerId, Container.pause, "Paused");
            };

            $scope.pauseSelectedAction = function () {

                batch($scope.containers, Container.pause, "Paused");
            };

            $scope.unpauseAction = function (containerId) {

                executeAction(containerId, Container.unpause, "Unpaused");
            };

            $scope.unpauseSelectedAction = function () {

                batch($scope.containers, Container.unpause, "Unpaused");
            };

            $scope.removeSelectedAction = function () {

                batch($scope.containers, Container.remove, "Removed");
            };

            $scope.removeAction = function (containerId) {

                executeAction(containerId, Container.remove, "Removed");
            };

            $scope.checkStatus = function ( text ){

                if (text === 'Ghost' || text === '') {
                    return 'died';
                }

                else if (text.indexOf('Exit') !== -1 && text !== 'Exit 0') {

                        return 'died';
                }
                else if( text.indexOf('Paused') >= 0  ){
                    return 'paused';
                }

                return 'running';
            };

            Object.defineProperty($scope, "queryFilter", {
                get: function () {
                    var out = {};
                    out[$scope.queryBy || "$"] = $scope.query;
                    return out;
                }
            });

            update({all: Settings.displayAll ? 1 : 0});
        }]);
