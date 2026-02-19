// ==UserScript==
// @name              Mean Chess
// @version           0.1
// @description       Dishonourable chess
// @author            kcl
// @connect           *
// @match             https://lichess.org/*

// @grant GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
window.addEventListener("load", function() {

const tileCoordinates = {
	a1: { x: 3.5, y: -3.5 },
	a2: { x: 3.5, y: -2.5 },
	a3: { x: 3.5, y: -1.5 },
	a4: { x: 3.5, y: -0.5 },
	a5: { x: 3.5, y: 0.5 },
	a6: { x: 3.5, y: 1.5 },
	a7: { x: 3.5, y: 2.5 },
	a8: { x: 3.5, y: 3.5 },

	b1: { x: 2.5, y: -3.5 },
	b2: { x: 2.5, y: -2.5 },
	b3: { x: 2.5, y: -1.5 },
	b4: { x: 2.5, y: -0.5 },
	b5: { x: 2.5, y: 0.5 },
	b6: { x: 2.5, y: 1.5 },
	b7: { x: 2.5, y: 2.5 },
	b8: { x: 2.5, y: 3.5 },

	c1: { x: 1.5, y: -3.5 },
	c2: { x: 1.5, y: -2.5 },
	c3: { x: 1.5, y: -1.5 },
	c4: { x: 1.5, y: -0.5 },
	c5: { x: 1.5, y: 0.5 },
	c6: { x: 1.5, y: 1.5 },
	c7: { x: 1.5, y: 2.5 },
	c8: { x: 1.5, y: 3.5 },

	d1: { x: 0.5, y: -3.5 },
	d2: { x: 0.5, y: -2.5 },
	d3: { x: 0.5, y: -1.5 },
	d4: { x: 0.5, y: -0.5 },
	d5: { x: 0.5, y: 0.5 },
	d6: { x: 0.5, y: 1.5 },
	d7: { x: 0.5, y: 2.5 },
	d8: { x: 0.5, y: 3.5 },

	e1: { x: -0.5, y: -3.5 },
	e2: { x: -0.5, y: -2.5 },
	e3: { x: -0.5, y: -1.5 },
	e4: { x: -0.5, y: -0.5 },
	e5: { x: -0.5, y: 0.5 },
	e6: { x: -0.5, y: 1.5 },
	e7: { x: -0.5, y: 2.5 },
	e8: { x: -0.5, y: 3.5 },

	f1: { x: -1.5, y: -3.5 },
	f2: { x: -1.5, y: -2.5 },
	f3: { x: -1.5, y: -1.5 },
	f4: { x: -1.5, y: -0.5 },
	f5: { x: -1.5, y: 0.5 },
	f6: { x: -1.5, y: 1.5 },
	f7: { x: -1.5, y: 2.5 },
	f8: { x: -1.5, y: 3.5 },

	g1: { x: -2.5, y: -3.5 },
	g2: { x: -2.5, y: -2.5 },
	g3: { x: -2.5, y: -1.5 },
	g4: { x: -2.5, y: -0.5 },
	g5: { x: -2.5, y: 0.5 },
	g6: { x: -2.5, y: 1.5 },
	g7: { x: -2.5, y: 2.5 },
	g8: { x: -2.5, y: 3.5 },

	h1: { x: -3.5, y: -3.5 },
	h2: { x: -3.5, y: -2.5 },
	h3: { x: -3.5, y: -1.5 },
	h4: { x: -3.5, y: -0.5 },
	h5: { x: -3.5, y: 0.5 },
	h6: { x: -3.5, y: 1.5 },
	h7: { x: -3.5, y: 2.5 },
	h8: { x: -3.5, y: 3.5 },
};

const defaultApiBaseUrl = "http://127.0.0.1:5000";

function getApiBaseUrl() {
	const apiInput = document.getElementById("apiBaseUrl");
	if (!apiInput) return defaultApiBaseUrl;
	const trimmed = apiInput.value.trim();
	return trimmed === "" ? defaultApiBaseUrl : trimmed.replace(/\/$/, "");
}

function saveApiBaseUrl() {
	const apiInput = document.getElementById("apiBaseUrl");
	if (!apiInput) return;
	localStorage.setItem("meanChessApiBaseUrl", apiInput.value.trim());
}

function loadApiBaseUrl() {
	const saved = localStorage.getItem("meanChessApiBaseUrl");
	if (saved) {
		document.getElementById("apiBaseUrl").value = saved;
	}
}

function whatPlayerColour(username) {
	let whitePlayer = document.querySelector(".player.color-icon.is.white.text .user-link").textContent;
	if (whitePlayer.includes(username)) {
		return (-1);
	}
	return 1;
}

function getMoveHistory() {
	const movePositionHistory = document.getElementsByTagName("kwdb");
  let j = 0;
  let algebraicMoveHistory = [];
  for (let i = 0; i < movePositionHistory.length; i += 2) {
		const move1 = movePositionHistory[i].textContent;
		let move2 = '';
	    if (i + 1 < movePositionHistory.length) {
	    	move2 = movePositionHistory[i + 1].textContent;
	    }

	    algebraicMoveHistory.push(move1 + ' ' + move2);
	    j++;
	  }
  return algebraicMoveHistory.toString().replace(/,/g, ' ');
}

function drawArrow(startSquare, destinationSquare, opacity, color, arrowHead) {
	const svgNS = "http://www.w3.org/2000/svg";
	const newElement = document.createElementNS(svgNS, "g");

	const cgHashValue = `$400,400,${startSquare},${destinationSquare},green`;
	newElement.setAttribute("cgHash", cgHashValue);

	const lineElement = document.createElementNS(svgNS, "line");
	lineElement.setAttribute("stroke", color);
	lineElement.setAttribute("stroke-width", "0.15625");
	lineElement.setAttribute("stroke-linecap", "round");
	lineElement.setAttribute("marker-end", "url(#arrowhead-" + arrowHead + ")");
	lineElement.setAttribute("opacity", opacity);
	lineElement.setAttribute("x1", playerColour * tileCoordinates[startSquare]['x']);
	lineElement.setAttribute("y1", playerColour * tileCoordinates[startSquare]['y']);
	lineElement.setAttribute("x2", playerColour * tileCoordinates[destinationSquare]['x']);
	lineElement.setAttribute("y2", playerColour * tileCoordinates[destinationSquare]['y']);

	newElement.appendChild(lineElement);

	const parentG = document.querySelector(".cg-shapes g");
	parentG.appendChild(newElement);
}

function removeArrow() {
    const parentG = document.querySelector(".cg-shapes g");
    while (parentG.firstChild) {
      parentG.removeChild(parentG.firstChild);
    }
}

function fetchMove(depth) {
	let moveHistory = getMoveHistory();
	GM_xmlhttpRequest({
		method: "GET",
		url: getApiBaseUrl() + "/api?algebra=" + moveHistory.toString() + "&depth=" + depth + "&discrete=1",
		onload: function(response) {
			const moves = JSON.parse(response.responseText);
			const arrowStyles = [
				{ color: "#15781B", arrowHead: "g" },
				{ color: "#2B6BE0", arrowHead: "b" },
				{ color: "#D14646", arrowHead: "r" }
			];

			moves.slice(0, arrowStyles.length).forEach(function(move, index) {
				if (move.length < 4) return;
				const startSquare = move.slice(0, 2);
				const destinationSquare = move.slice(2, 4);
				const style = arrowStyles[index];
				drawArrow(startSquare, destinationSquare, 1, style.color, style.arrowHead);
			});
		}
	});
}


function getDepth() {
	if (document.getElementById("depth").value == '') {
		return "0.5"; // No need to make it string, but it makes it more consistent
	}
	return document.getElementById("depth").value;
}

// ************************************ NORMAL
const markerElement = document.createElementNS("http://www.w3.org/2000/svg", "marker");
markerElement.setAttribute("id", "arrowhead-g");
markerElement.setAttribute("orient", "auto");
markerElement.setAttribute("overflow", "visible");
markerElement.setAttribute("markerWidth", "4");
markerElement.setAttribute("markerHeight", "4");
markerElement.setAttribute("refX", "2.05");
markerElement.setAttribute("refY", "2");
markerElement.setAttribute("cgKey", "g");

const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
pathElement.setAttribute("d", "M0,0 V4 L3,2 Z");
pathElement.setAttribute("fill", "#15781B");
// ************************************ NORMAL

const markerElementBlue = document.createElementNS("http://www.w3.org/2000/svg", "marker");
markerElementBlue.setAttribute("id", "arrowhead-b");
markerElementBlue.setAttribute("orient", "auto");
markerElementBlue.setAttribute("overflow", "visible");
markerElementBlue.setAttribute("markerWidth", "4");
markerElementBlue.setAttribute("markerHeight", "4");
markerElementBlue.setAttribute("refX", "2.05");
markerElementBlue.setAttribute("refY", "2");
markerElementBlue.setAttribute("cgKey", "b");

const pathElementBlue = document.createElementNS("http://www.w3.org/2000/svg", "path");
pathElementBlue.setAttribute("d", "M0,0 V4 L3,2 Z");
pathElementBlue.setAttribute("fill", "#2B6BE0");

const markerElementRed = document.createElementNS("http://www.w3.org/2000/svg", "marker");
markerElementRed.setAttribute("id", "arrowhead-r");
markerElementRed.setAttribute("orient", "auto");
markerElementRed.setAttribute("overflow", "visible");
markerElementRed.setAttribute("markerWidth", "4");
markerElementRed.setAttribute("markerHeight", "4");
markerElementRed.setAttribute("refX", "2.05");
markerElementRed.setAttribute("refY", "2");
markerElementRed.setAttribute("cgKey", "r");

const pathElementRed = document.createElementNS("http://www.w3.org/2000/svg", "path");
pathElementRed.setAttribute("d", "M0,0 V4 L3,2 Z");
pathElementRed.setAttribute("fill", "#D14646");

markerElement.appendChild(pathElement);
markerElementBlue.appendChild(pathElementBlue);
markerElementRed.appendChild(pathElementRed);

const defsElement = document.querySelector(".cg-shapes defs");

if (defsElement) {
  defsElement.appendChild(markerElement);
  defsElement.appendChild(markerElementBlue);
  defsElement.appendChild(markerElementRed);
}


var player = document.getElementById("user_tag").textContent;
var playerColour = whatPlayerColour(player);

const styleElement = document.createElement('style');
const cssRules = `
.control-box {
  background-color: #333;
  color: white;
  padding: 8px;
  border-radius: 2px;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.cheatButton {
  background-color: #555;
  color: white;
  border: none;
  padding: 10px 1.5%;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.cheatButton:hover {
  background-color: #444;
}

#depth,
#apiBaseUrl {
  background-color: #ddd;
  color: #333;
  border: none;
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  width: 24%;
}

p {
  color: #aaa;
  margin: 10px 0;
}

`;
styleElement.textContent = cssRules;
document.head.appendChild(styleElement);

const controlBoxDiv = document.createElement('div');
controlBoxDiv.classList.add('control-box');
controlBoxDiv.innerHTML = `
<div class="control-box">
    <button id="moveButton" class="cheatButton">Show Best Move</button>
    <input id="depth" type="text" placeholder="Analysis depth (seconds)">
    <input id="apiBaseUrl" type="text" placeholder="API URL (default http://127.0.0.1:5000)">
    <p>Shows top 3 moves: best (green), second (blue), third (red).</p>
</div>
`;

document.body.appendChild(controlBoxDiv);

const getBestMoveButton = document.getElementById("moveButton");
const apiBaseUrlInput = document.getElementById("apiBaseUrl");

loadApiBaseUrl();
apiBaseUrlInput.addEventListener("change", saveApiBaseUrl);

getBestMoveButton.addEventListener("click", function() {
	let depth = getDepth();
	removeArrow();
	fetchMove(depth);
});
});

})();
