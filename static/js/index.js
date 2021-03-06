$(document).ready(function(){

  //initialize variables
  var score = 0
  var tempscore = 100
  var time = 30
  var name = null
  var sound = new Audio("/static/sounds/ding.wav")
  var socket = io.connect('http://localhost')

  //update score and time displays
  $("#score").text(score)
  $("#time").text(time)

  //define functions
  var loadHighScores = function() {
    $("#highscores").remove()
    $("<div/>", {'id':'highscores'}).appendTo("#game").html("<h1>High Scores:</h1>")
    $.get("/highscores", function(data) {
      var scoreobjects = data.split('\n')
      for(i=0; i<scoreobjects.length-1; i++) {
        scoreobjects[i] = $.parseJSON(scoreobjects[i])
      }
      $("<ol/>", {'id': 'highscorelist'}).appendTo("#highscores")
      var highlighted = false
      for(i=0; i<scoreobjects.length-1; i++) {
        $("<li/>", {'id':i, text:scoreobjects[i]["name"]+": "+scoreobjects[i]["score"]}).appendTo("#highscorelist")
        if(highlighted==false && scoreobjects[i]["name"]==name && scoreobjects[i]["score"]==score) {
          $("#"+i).css('color','yellow')
          highlighted = true
        }
      }
    })
  }

  var gameStart = function() {
    $("#start").hide(0, function(){
      //change cursor to crosshair
      $("#game").css('cursor','crosshair')
      //create target
      $("<div/>", {'id':'target'}).appendTo("#game").css('top', Math.random()*550).css('left', Math.random()*750)
      //target hit
      $("#target").click(function(e){
        sound.play()
        $(this).stop()
        $(document).stopTime('tempscore')
        score += tempscore
        //show points for earned for hit
        $("<div/>", {'class':'tempscore','text':tempscore}).appendTo("#game").css('top', e.pageY).css('left', e.pageX).animate({'top': '-=10'}, 200).fadeOut(200, function(){$(this).remove()})
        $("#score").text(score)
        tempscore = 100
        $(document).everyTime(25, 'tempscore', function(){if (tempscore > 1) {tempscore -= 1}})
        $(this).animate({'top': Math.random()*550, 'left': Math.random()*750}, 200)
      })
      //game timer
      $(document).everyTime(1000, function(){
        time -= 1
        $("#time").text(time) 
        //game ends
        if(time == 0) {
          gameEnd()
        }
      }, time)
    })
  }

  var gameEnd = function() {
    //change cursor to auto
    $("#game").css('cursor', 'auto')
    //remove target
    $("#target").remove()
    //create highscore list
    loadHighScores()
    //create highscore submission area
    $("<div/>", {'id':'scoresform'}).appendTo("#game")
    //create name input field
    $("<input/>", {'id':'nameinput','type':'text', 'value':'Enter your name', 'onclick':'if (this.value=="Enter your name") {this.value=""}', 'onblur':'if (this.value=="") {this.value="Enter your name"}'}).appendTo("#scoresform")
    //create submit score button
    $("<input/>", {'id':'submitbutton','type':'submit','value':'Submit score'}).appendTo("#scoresform")
    //click event for submit button
    $("#submitbutton").click(function() {
        //set name variable
        name = $("#nameinput").attr('value')
        //send name and score and reload high scores
        socket.emit('submitscore', {name: name, score: score})
        //remove name input field
        $("#nameinput").remove()
        //remove submit button
        $("#submitbutton").remove()
        //create play again button
        $("<input/>", {'id':'playagainbutton','type':'submit','value':'Play again?'}).appendTo("#scoresform")
        //shift scoresform area to the right
        $("#scoresform").css('left', '+=95')
        //click event for play again button
        $("#playagainbutton").click(playAgain)
    })
  }

  var playAgain = function() {
    $("#highscores").remove()
    $("#scoresform").remove()
    $("#start").show()
    //reset variables
    score = 0
    tempscore = 100
    time = 30
    //update score and time displays
    $("#score").text(score)
    $("#time").text(time)
  }


  //click event for start button
  $("#start").click(gameStart)

})


