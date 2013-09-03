var app = angular.module('myApp', ['pouchDB']);

app.controller('MainCtrl', ['$scope', 'notes', '$rootScope', 'notesListener', 
	function($scope, notes, $rootScope, notesListener) {

		$scope.add = function(note) {
			notes.create(note).then(function(result) {
				$scope.note = null;
			}, function(error) {

			});
		}

		$scope.deleteAll = function() {
			notes.all().then(function(results) {
				angular.forEach(results, function(result) {
					notes.delete(result.doc);
				});
			}, function(error){

			});
		}

		$rootScope.$on('newNote', function(event, data) {
			$scope.notes.push(data)
		});

		$rootScope.$on('deletedNote', function(event, data) {
			$scope.notes.splice(data)
		});

		notes.all().then(function(results) {
			angular.forEach(results, function(result) {
				result = result.doc;
			});
			$scope.notes = results;
		}, function(error) {
			$scope.notes = [];
		});

	}
]);