var db;
var jQT = $.jQTouch({
    icon: 'gitq-icon.png',
    startupScreen: 'gitq-startup.png',
    statusBar: 'blue',
    touchSelector: '.swipe p'
});
$(document).ready(function() {
    $('#createEntry form').submit(createEntry);

    $('#settings form').submit(saveSettings);
    $('#settings').bind('pageAnimationStart', loadSettings);
    $('#notes form').submit(saveNotes);
    $('#notes').bind('pageAnimationStart', loadNotes);
    
    // Define start date in the index file
    // Set arbitrary future date to display all 5 days
    var wednesday = new Date('June 12, 2013');
    var sunday = new Date();
    sunday.setDate(wednesday.getDate()+4);
    var rightNow = new Date();  
    var rightNowDay = rightNow.getDay();
    // remove past days only if we are inside the current race week
    if (rightNow > wednesday && rightNow <= sunday) { 
      $('#4').hide();
      if (rightNowDay > 5) {
        $('#5').hide();
      }
      else if (rightNowDay > 6) {
        $('#6').hide();
      }
      else if (rightNowDay > 7) {
        $('#7').hide();
      }        
    }
    
    $('#mercredi').bind("swipe", function(event, info) {
      if (info.direction === 'left') {
        jQT.goTo($('#jeudi'), 'cube');
      }
      if (info.direction === 'right') {
	      jQT.goBack($('#dates'), 'swap');
      }			
    });
    $('#jeudi').bind("swipe", function(event, info) {
      if (info.direction === 'left') {
        jQT.goTo($('#vendredi'), 'cube');
      }
      if (info.direction === 'right') {
	      jQT.goTo($('#mercredi'), 'swap');
      }			
    });
    $('#vendredi').bind("swipe", function(event, info) {
      if (info.direction === 'left') {
        jQT.goTo($('#samedi'), 'cube');
      }
      if (info.direction === 'right') {
	      jQT.goTo($('#jeudi'), 'swap');
      }			
    });
    $('#samedi').bind("swipe", function(event, info) {
      if (info.direction === 'left') {
        jQT.goTo($('#dimanche'), 'cube');
      }
      if (info.direction === 'right') {
	      jQT.goTo($('#vendredi'), 'swap');
      }			
    });
    $('#dimanche').bind("swipe", function(event, info) {
      if (info.direction === 'right') {
	jQT.goTo($('#samedi'), 'swap');
      }			
    });
    
    var shortName = 'GITQ';
    var version = '1.0';
    var displayName = 'GITQ';
    var maxSize = 65536;
    db = openDatabase(shortName, version, displayName, maxSize);
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'CREATE TABLE IF NOT EXISTS entries ' +
                ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                ' date DATE NOT NULL, food TEXT NOT NULL, ' +
                ' calories INTEGER NOT NULL );'
            );
        }
    );
});

function saveSettings() {
    localStorage.nom = $('#nom').val();
    jQT.goBack();
    return false;
}

function loadSettings() {
    $('#nom').val(localStorage.nom);
}

function saveNotes() {
    localStorage.note = $('#note').val();
    jQT.goBack();
    return false;
}

function loadNotes() {
    $('#note').val(localStorage.note);
}

function refreshEntries() {
    var currentDate = sessionStorage.currentDate;
    $('#date h1').text(currentDate);
    $('#date ul li:gt(0)').remove();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM entries WHERE date = ? ORDER BY food;',
                [currentDate],
                function (transaction, result) {
                    for (var i=0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        var newEntryRow = $('#entryTemplate').clone();
                        newEntryRow.removeAttr('id');
                        newEntryRow.removeAttr('style');
                        newEntryRow.data('entryId', row.id);
                        newEntryRow.appendTo('#date ul');
                        newEntryRow.find('.label').text(row.food);
                        newEntryRow.find('.calories').text(row.calories);
                        newEntryRow.find('.delete').click(function(){
                            var clickedEntry = $(this).parent();
                            var clickedEntryId = clickedEntry.data('entryId');
                            deleteEntryById(clickedEntryId);
                            clickedEntry.slideUp();
                        });
                    }
                },
                errorHandler
            );
        }
    );
}
function createEntry() {
    var date = sessionStorage.currentDate;
    var calories = $('#calories').val();
    var food = $('#food').val();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO entries (date, calories, food) VALUES (?, ?, ?);',
                [date, calories, food],
                function(){
                    refreshEntries();
                    jQT.goBack();
                },
                errorHandler
            );
        }
    );
    return false;
}

function errorHandler(transaction, error) {
    alert('Oops. Error was '+error.message+' (Code '+error.code+')');
    return true;
}

function deleteEntryById(id) {
    db.transaction(
        function (transaction) {
            transaction.executeSql('DELETE FROM entries WHERE id=?;', [id], null, errorHandler);
        }
    );
}
