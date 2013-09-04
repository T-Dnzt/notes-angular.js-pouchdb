// Create a pouchDB module to inject in our myApp module.
var db = angular.module('pouchDB', []);

// Gets or creates the notes database.
db.factory('notesDB', function(){
    return new Pouch('notes');
});

// Registers create and delete events and broadcast them.
db.factory('notesListener', ['$rootScope', 'notesDB', function($rootScope, notesDB) {

    notesDB.changes({
    	continuous: true,
        onChange: function(change) {
            if (change.deleted) {
            	$rootScope.$apply(function() {
                    $rootScope.$broadcast('deletedNote');
                });  
            } else {
                $rootScope.$apply(function() {
                    notesDB.get(change.id, function(err, doc) {
                        $rootScope.$apply(function() {
                            if (err) console.log(err);
                            $rootScope.$broadcast('newNote', doc);
                        })
                    });
                })
            }
        }
    })
}]);

/* Our note model, used for CRUD operations 
   and to retrieve the list of notes.
   Promises are used to transmit callback results. */
db.service('notes', ['notesDB', '$q', '$rootScope', 
	function(notesDB, $q, $rootScope) {
		var _this = this;

		// Build the note object.
		this.build = function(note) {
			return {
				author: note.author,
				content: note.content
			};
		};

		// Retrieve a note based on its id.
		this.get = function(id) {
			var d = $q.defer();
			notesDB.get(id, function(err, result) {
				!err ? d.resolve(result) : d.reject(err)
			});
			return d.promise;
		};

		//Creates a new note.
		this.create = function(note) {
			var d = $q.defer();
			notesDB.post(_this.build(note), function(err, result) {
				!err ? d.resolve(result) : d.reject(err)
			});
			return d.promise;
		};

		//Updates an existing note.
		this.update = function(note, author, content) {
			note.author = author;
			note.content = content;
			notesDB.put(note);
		};

		// Deletes a note.
		this.delete = function(note) {
			notesDB.remove(note);
		};

		// Retrieves all the notes from the database.
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
