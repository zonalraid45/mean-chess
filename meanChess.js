// ==UserScript==
// @name              Mean Chess
// @version           0.2
// @description       Sends your current Lichess position to a GitHub Actions workflow after each opponent move.
// @author            kcl
// @match             https://lichess.org/*
// @connect           api.github.com
// @grant             GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG = {
    owner: 'YOUR_GITHUB_USERNAME',
    repo: 'YOUR_REPO_NAME',
    workflowFile: 'tampermonkey-api.yml',
    githubToken: 'YOUR_GITHUB_PAT',
    ref: 'main',
    depthSeconds: '0.7',
    pollMs: 2000,
  };

  const LAST_SENT_PLY_KEY = 'meanChessLastSentPly';

  function getUsername() {
    const tag = document.getElementById('user_tag');
    return tag ? tag.textContent.trim() : '';
  }

  function getWhitePlayerName() {
    const whitePlayer = document.querySelector('.player.color-icon.is.white.text .user-link');
    return whitePlayer ? whitePlayer.textContent.trim() : '';
  }

  function getBlackPlayerName() {
    const blackPlayer = document.querySelector('.player.color-icon.is.black.text .user-link');
    return blackPlayer ? blackPlayer.textContent.trim() : '';
  }

  function getMyColor() {
    const me = getUsername();
    if (!me) return null;

    if (getWhitePlayerName().includes(me)) return 'white';
    if (getBlackPlayerName().includes(me)) return 'black';
    return null;
  }

  function getOpponentName(myColor) {
    return myColor === 'white' ? getBlackPlayerName() : getWhitePlayerName();
  }

  function getMoveList() {
    const moveNodes = document.getElementsByTagName('kwdb');
    return Array.from(moveNodes)
      .map((node) => node.textContent.trim())
      .filter(Boolean);
  }

  function getAlgebraicHistory() {
    return getMoveList().join(' ');
  }

  function getPlyCount() {
    return getMoveList().length;
  }

  function getCurrentMoveNumber(plyCount) {
    return Math.floor((plyCount + 1) / 2);
  }

  function isMyTurn(myColor, plyCount) {
    if (myColor === 'white') {
      return plyCount % 2 === 0;
    }
    if (myColor === 'black') {
      return plyCount % 2 === 1;
    }
    return false;
  }

  function getGameLink() {
    return `${window.location.origin}${window.location.pathname}`;
  }

  function shouldSendNow(myColor, plyCount) {
    if (!isMyTurn(myColor, plyCount)) return false;
    if (plyCount === 0) return false;

    const lastSent = parseInt(localStorage.getItem(LAST_SENT_PLY_KEY) || '-1', 10);
    return plyCount !== lastSent;
  }

  function markSent(plyCount) {
    localStorage.setItem(LAST_SENT_PLY_KEY, String(plyCount));
  }

  function validateConfig() {
    const missing = [];
    if (!CONFIG.owner || CONFIG.owner === 'YOUR_GITHUB_USERNAME') missing.push('owner');
    if (!CONFIG.repo || CONFIG.repo === 'YOUR_REPO_NAME') missing.push('repo');
    if (!CONFIG.githubToken || CONFIG.githubToken === 'YOUR_GITHUB_PAT') missing.push('githubToken');
    return missing;
  }

  function dispatchWorkflow(payload, onDone) {
    const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/actions/workflows/${CONFIG.workflowFile}/dispatches`;

    GM_xmlhttpRequest({
      method: 'POST',
      url,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${CONFIG.githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        ref: CONFIG.ref,
        inputs: payload,
      }),
      onload: function (response) {
        if (response.status >= 200 && response.status < 300) {
          console.log('[MeanChess] Position sent to GitHub Actions:', payload);
          onDone(true);
        } else {
          console.error('[MeanChess] GitHub dispatch failed:', response.status, response.responseText);
          onDone(false);
        }
      },
      onerror: function (error) {
        console.error('[MeanChess] Network error dispatching workflow:', error);
        onDone(false);
      },
    });
  }

  function maybeSendPosition() {
    const missing = validateConfig();
    if (missing.length > 0) {
      return;
    }

    const myColor = getMyColor();
    if (!myColor) return;

    const plyCount = getPlyCount();
    if (!shouldSendNow(myColor, plyCount)) return;

    const algebra = getAlgebraicHistory();
    const payload = {
      algebra,
      depth: CONFIG.depthSeconds,
      opponent: getOpponentName(myColor) || 'Unknown',
      current_move: String(getCurrentMoveNumber(plyCount)),
      game_url: getGameLink(),
    };

    dispatchWorkflow(payload, function (ok) {
      if (ok) markSent(plyCount);
    });
  }

  window.addEventListener('load', function () {
    setInterval(maybeSendPosition, CONFIG.pollMs);
    console.log('[MeanChess] Auto-send mode started. Positions will be sent after opponent moves.');
  });
})();
