var app = angular.module('myApp', ['pouchDB']);

app.controller('MainCtrl', ['$scope', 'notes', '$rootScope', 'notesListener', 
	function($scope, notes, $rootScope, notesListener) {

		$scope.notes = [];

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

		// Listener on newNote event sent by pouchDB changes method.
		$rootScope.$on('newNote', function(event, note) {
			$scope.notes.push(note)
		});

		// Listener on deleteNote snet by pouchDB changes method.
		$rootScope.$on('deletedNote', function(event, note) {
			$scope.notes.splice(note)
		});

		notes.all().then(function(results) {
			angular.forEach(results, function(result) {
				$scope.notes.push(result.doc);
			});
		}, function(error) {
			$scope.notes = [];
		});

	}
]);