var db = angular.module('pouchDB', []);

// Gets or creates the notes database
db.factory('notesDB', function(){
    return new Pouch('notes');
});

//
db.factory('notesListener', ['$rootScope', 'notesDB', function($rootScope, notesDB) {

    notesDB.changes({
        continuous: true,
        onChange: function(change) {
            if (!change.deleted) {
                $rootScope.$apply(function() {
                    notesDB.get(change.id, function(err, doc) {
                        $rootScope.$apply(function() {
                            if (err) console.log(err);
                            $rootScope.$broadcast('newNote', doc);
                        })
                    });
                })
            } else {
                $rootScope.$apply(function() {
                    $rootScope.$broadcast('deletedNote', change.id);
                });
            }
        }
    })
}]);

// The Note model. This service returns promises.
db.service('notes', ['notesDB', '$q', '$rootScope', 
	function(notesDB, $q, $rootScope) {
		var _this = this;

		this.build = function(note) {
			return {
				_id: new Date().toISOString(),
				author: note.author,
				content: note.content
			};
		};

		this.get = function(id) {
			var d = $q.defer();
			notesDB.get(id, function(err, result) {
				!err ? d.resolve(result) : d.reject(err)
			});
			return d.promise;
		};

		this.create = function(note) {
			var d = $q.defer();
			notesDB.put(_this.build(note), function(err, result) {
				!err ? d.resolve(result) : d.reject(err)
			});
			return d.promise;
		};

		this.update = function(note, author, content) {
			note.author = author;
			note.content = content;
			notesDB.put(note);
		};

		this.delete = function(note) {
			notesDB.remove(note);
		};

		this.all = function() {
			var d = $q.defer();
			notesDB.allDocs({include_docs: true}, function(err, doc) {
				$rootScope.$apply(function() {
					!err ? d.resolve(doc.rows) : d.reject(err)
				});
			});
			return d.promise;
		}
	}
]);
