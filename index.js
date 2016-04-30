var boardData = [];
var canDown = [];

var isMe = true;


window.onload = function () {
	var canvas = document.getElementById("heibaiqi");

	canvas.width = 450;
	canvas.height = 450;

	var cxt = canvas.getContext("2d");

	initBoard();
	updateChessBoard( cxt);
	updateCanDown( true, canDown);

	var restart = document.getElementById("restart");
	restart.addEventListener("click", function(){
		initBoard();
		updateChessBoard( cxt);
		updateCanDown( true, canDown);
	});

	var help = document.getElementById("help");
	help.addEventListener("click", function(){
		var point = computerPoint( true);
		drawHelp(point.i, point.j, cxt);
		var info = document.getElementById("info");
		setTimeout(function(){updateChessBoard( cxt);},500);
	});

	var isClicked = false;
	canvas.onclick = function ( event) {
		var x = event.offsetX, y = event.offsetY;
		var i = Math.floor((x-25)/50), j = Math.floor((y-25)/50);
		var count = 0;
		if (canDown[j][i] && !isClicked) {
			isClicked = true;
			drawOneChess(i, j, cxt, true);
			updateBoardData( true, j, i, boardData);
			setTimeout(function(){updateChessBoard( cxt);}, 300);
			
			if(!isGameOver()){
				count = updateCanDown( false, canDown);
				if( count<=0) {
					alert("计算机没有地方可以落子，请走下一步");
					updateCanDown( true, canDown);
				}else {
					setTimeout(function(){computerDown( cxt); isClicked = false;}, 1000);	
				}
			}
		}
	}
}

function initBoard() {
	for(var i=0; i<8; i++) {
		canDown[i] = [];
		boardData[i] = [];
		for(var j=0; j<8; j++) {
			boardData[i][j] = 0;
			canDown[i][j] = false;
		}
	}
	boardData[3][3] = boardData[4][4] = 1;
	boardData[3][4] = boardData[4][3] = 2;
}

function drawHelp(i, j, cxt) {
	cxt.fillStyle = "red";
	
	cxt.beginPath();
	cxt.arc(50+50*j, 50+50*i, 20, 0, 2*Math.PI);
	cxt.closePath();
	
	cxt.fill();
}

function drawChessBoard ( cxt) {
	cxt.strokeStyle = "#C3C3C3";
	for (var i=0; i<9; i++) {
		cxt.moveTo(25+50*i, 25);
		cxt.lineTo(25+50*i, 425);
		cxt.stroke();
		cxt.moveTo(25, 25+50*i);
		cxt.lineTo(425, 25+50*i);
		cxt.stroke();
	}
}

function computerDown ( cxt) {
	var result = computerPoint( false);
	drawOneChess(result.j, result.i, cxt, false);
	updateBoardData( false, result.i, result.j, boardData);
	setTimeout(function(){updateChessBoard( cxt);}, 300);
	if(!isGameOver() ){
		var count = updateCanDown( true, canDown);
		if( count<=0) {
			alert("你没有地方可以落子，计算机继续落子！");
			setTimeout(computerDown( cxt), 500);
			updateCanDown( false, canDown);
		}
	}
}

function drawOneChess (i, j, context, isMe) {
	var audio = document.getElementsByTagName("audio")[0];
	audio.play();
	var gradient = context.createRadialGradient(50+50*i, 50+50*j, 6, 50+50*i, 50+50*j, 13);
	if ( isMe ){
		gradient.addColorStop(0, "#817F7F");
		gradient.addColorStop(1, "#0F0E0E");
		boardData[j][i] = 1;
		
	}else {
		gradient.addColorStop(0, "#DCDADA");
		gradient.addColorStop(1, "#BFBEBE");
		boardData[j][i] = 2;
		
	}
	context.fillStyle = gradient;
	context.beginPath();
	console.log(i+","+j+":"+(30+50*i)+","+(30+50*j));
	context.arc(50+50*i, 50+50*j, 20, 0, 2*Math.PI);
	context.closePath();
	context.fill();
	
}

function computerPoint( isMe) {
	var boardTemp = [];
	var count = 0;
	var downType = [];
	var result = {i:0, j:0};
	var max = 0;

	for(var i=0; i<8; i++) {
		boardTemp[i] = [];
		for(var j=0; j<8; j++) {
			boardTemp[i][j] = boardData[i][j];
			if(canDown[i][j]) {
				downType[count++] = {x:i, y:j, score:0};
			}
		}
	}

	for(var k=0, len=downType.length; k<len; k++) {

		

		if( !isMe) {
			boardTemp[downType[k].x][downType[k].y] = 2;
			updateBoardData(false, downType[k].x, downType[k].y, boardTemp);
			downType[k].score = calcScore( boardTemp);
			if (downType[k].score.computer>max) {
				max = downType[k].score.computer;
				result.i =  downType[k].x;
				result.j = downType[k].y;
			}
		}else {
			boardTemp[downType[k].x][downType[k].y] = 1;
			updateBoardData(true, downType[k].x, downType[k].y, boardTemp);
			downType[k].score = calcScore( boardTemp);

			if (downType[k].score.me>max) {
				max = downType[k].score.me;
				result.i =  downType[k].x;
				result.j = downType[k].y;
			}
		}
		

		for(var i=0; i<8; i++) {
			for(var j=0; j<8; j++) {
				boardTemp[i][j] = boardData[i][j];
			}
		}

	}
	return result;
}

function updateCanDown( isMe, canDown ) {
	var enemy = 2,
		me = 1;
	if( !isMe) {
		enemy = 1;
		me = 2;

	}

	var count = 0;
	for(var i=0; i<8; i++) {
		for(var j=0; j<8; j++) {
			if( boardData[i][j]) {
				canDown[i][j] = false;
				continue;
			}

			for(var m=-1; m<=1; m++) {
				if( m+i<0 || m+i>=8 ) {
					canDown[i][j] = false;
					continue;
				}
				for(var n=-1; n<=1; n++) {
					if( n+j<0 || n+j>=8 ) {
						canDown[i][j] = false;
						continue;
					}

					if( boardData[m+i][n+j] === enemy) {
						
						for(var k=2; k<8; k++) {

							if( i+m*k>=0 && i+m*k<8 && j+n*k>=0 && j+n*k<8) {
								if( boardData[i+m*k][j+n*k] === 0) {
									break;
								}

								if( boardData[i+m*k][j+n*k] === me){
									
									canDown[i][j] = true;
									count++;
									m = n = 2;
									break;
								}
							}else {
								canDown[i][j] = false;
								break;
							}
						}
						
					}else if( m===1 && n===1) {
						canDown[i][j] = false;
					}
				}
			}
			
			
		}
	}
	return count;
	
}

function updateBoardData ( isMe, i, j, boardData) {
	var enemy = 2,
		me = 1;

	if( !isMe) {
		enemy = 1;
		me = 2;

	}
	
	var canChange = false;


	for(var m=-1; m<=1; m++) {

		if( i+m<0 || i+m>=8) {
			continue;
		}

		for(var n=-1; n<=1; n++) {

			if( j+n<0 || j+n>=8) {
				continue;
			}

			if( boardData[i+m][j+n] === enemy) {

				for(var k=2; k<8; k++) {

					if( i+m*k>=0 && i+m*k<8 && j+n*k>=0 && j+n*k<8) {
						if( boardData[i+m*k][j+n*k] === 0) {
							break;
						}
						if( boardData[i+m*k][j+n*k] === me){
							canChange = true;
							break;
							
						}
					}else {
						break;
					}
				}
				if( canChange) {
					for(var k=1; k<8; k++) {

						if( i+m*k>=0 && i+m*k<8 && j+n*k>=0 && j+n*k<8) {
							if( boardData[i+m*k][j+n*k] === enemy){
								boardData[i+m*k][j+n*k] = me;
								
							}else {
								break;
							}
						}else {
							break;
						}
					}
				}
				canChange = false;

			}
		}
	}
}

//更新棋盘
function updateChessBoard ( cxt) {
	// 清除棋盘
	cxt.clearRect(0, 0, 450, 450);

	// 画棋盘
	drawChessBoard( cxt);

	// 画棋子
	for(var i=0; i<8; i++) {
		for(var j=0; j<8; j++) {
			if(boardData[i][j] === 1) {
				drawOneChess(j, i, cxt, true);
			}else if(boardData[i][j] ===2 ) {
				drawOneChess(j, i, cxt, false);
			}
		}
	}
	var score = calcScore( boardData);
	document.getElementById("score").textContent = "玩家："+ score.me + " ，计算机："+ score.computer;
}

function calcScore ( boardData) {
	var score = {me:0, computer:0}
	
	for(var i=0; i<8; i++) {
		for(var j=0; j<8; j++) {
			if(boardData[i][j] === 1) {
				score.me += 1;
			}else if(boardData[i][j] ===2 ) {
				score.computer += 1;
			}
		}
	}
	return score;
}

function isGameOver() {
	var score = {me:0, computer:0};

	for(var i=0; i<8; i++) {
		for(var j=0; j<8; j++) {

			if(boardData[i][j] === 1) {
				score.me++;
			}else if(boardData[i][j] ===2 ) {
				score.computer++;
			}

		}
	}

	if( score.me===0) {
		alert("游戏结束，计算机赢了");
		return true;
	}else if( score.computer ===0) {
		alert("游戏结束，你赢了");
		return true;

	}else if( score.me + score.computer === 64) {
		if(score.me < score.computer) {
			alert("游戏结束，你输了");
			return true;

		}else if(score.me > score.computer) {
			alert("游戏结束，你赢了");
			return true;

		}else if(score.me === score.computer) {
			alert("游戏结束，平局");
			return true;

		}
	}
	return false;
}
