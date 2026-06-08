/*
App Title: Farkle (10,000)
Credits: Tre Thacker
Year Created: 2026
Version: 1.00
Dedication: None
*/

/* <------------------------------------------------
      CHANGELOG

      Version 1.00 - Initial game creation.
   -------------------------------------------------> */

/* <------------------------------------------------
      APP INFORMATION CONSTANTS
   -------------------------------------------------> */
const APP_TITLE = "Farkle (10,000)";
const APP_CREDITS = "Tre Thacker";
const APP_YEAR = "2026";
const APP_VERSION = "1.00";
const APP_DEDICATION = "None";

/* <------------------------------------------------
      GAME SETTINGS CONSTANTS
   -------------------------------------------------> */
const WINNING_SCORE = 10000;
const ON_THE_BOARD_SCORE = 500;
const DICE_COUNT = 6;
const ROLL_ANIMATION_MS = 650;
const AI_THINK_MS = 750;

/* <------------------------------------------------
      DOM ELEMENTS
   -------------------------------------------------> */
const app = document.querySelector(".app");
const diceTable = document.getElementById("diceTable");
const optionsPlayerNameInput = document.getElementById("optionsPlayerNameInput");
const playerNameLabel = document.getElementById("playerNameLabel");
const optionsThemeSelect = document.getElementById("optionsThemeSelect");
const playerScoreEl = document.getElementById("playerScore");
const aiScoreEl = document.getElementById("aiScore");
const playerCard = document.getElementById("playerCard");
const aiCard = document.getElementById("aiCard");
const turnTitle = document.getElementById("turnTitle");
const statusText = document.getElementById("statusText");
const turnScoreEl = document.getElementById("turnScore");
const selectionReadout = document.getElementById("selectionReadout");
const onTheBoardMessage = document.getElementById("onTheBoardMessage");
const rollBtn = document.getElementById("rollBtn");
const bankBtn = document.getElementById("bankBtn");
const optionsBtn = document.getElementById("optionsBtn");
const helpBtn = document.getElementById("helpBtn");
const newGameOptionBtn = document.getElementById("newGameOptionBtn");
const exportBackupOptionBtn = document.getElementById("exportBackupOptionBtn");
const importBackupOptionBtn = document.getElementById("importBackupOptionBtn");
const shareBackupOptionBtn = document.getElementById("shareBackupOptionBtn");
const closeOptionsBtn = document.getElementById("closeOptionsBtn");
const backupFileInput = document.getElementById("backupFileInput");
const helpModal = document.getElementById("helpModal");
const closeHelpBtn = document.getElementById("closeHelpBtn");
const winnerModal = document.getElementById("winnerModal");
const winnerTitle = document.getElementById("winnerTitle");
const winnerText = document.getElementById("winnerText");
const playAgainBtn = document.getElementById("playAgainBtn");

const shareGuideModal = document.getElementById("shareGuideModal");
const continueShareBtn = document.getElementById("continueShareBtn");
const cancelShareBtn = document.getElementById("cancelShareBtn");

const importGuideModal = document.getElementById("importGuideModal");
const continueImportBtn = document.getElementById("continueImportBtn");
const cancelImportBtn = document.getElementById("cancelImportBtn");

const optionsModal = document.getElementById("optionsModal");

const logList = document.getElementById("logList");
const confetti = document.getElementById("confetti");

/* <------------------------------------------------
      INDEXEDDB DATABASE SETTINGS
   -------------------------------------------------> */
const DATABASE_NAME = "FarkleDB";
const DATABASE_VERSION = 1;

const STORE_SETTINGS = "settings";
const STORE_GAME_STATE = "gameState";
const STORE_STATISTICS = "statistics";
const STORE_ACHIEVEMENTS = "achievements";
const STORE_COIN_BANK = "coinBank";
const STORE_COLLECTIBLES = "collectibles";
const STORE_STORE_INVENTORY = "storeInventory";

const SETTINGS_RECORD_ID = "userSettings";
const GAME_STATE_RECORD_ID = "activeGame";
const STATISTICS_RECORD_ID = "playerStatistics";
const ACHIEVEMENTS_RECORD_ID = "playerAchievements";
const COIN_BANK_RECORD_ID = "playerCoinBank";
const COLLECTIBLES_RECORD_ID = "playerCollectibles";
const STORE_INVENTORY_RECORD_ID = "storeInventory";
const GAME_SNAPSHOT_VERSION = 1;

const DATABASE_BACKUP_STORES = [
   STORE_SETTINGS,
   STORE_GAME_STATE,
   STORE_STATISTICS,
   STORE_ACHIEVEMENTS,
   STORE_COIN_BANK,
   STORE_COLLECTIBLES,
   STORE_STORE_INVENTORY
];

let db = null;

/* <------------------------------------------------
      GAME STATE
   -------------------------------------------------> */
let state = createInitialState();

/* <------------------------------------------------
      INDEXEDDB DATABASE FUNCTIONS
   -------------------------------------------------> */
function initializeDatabase() {
   return new Promise((resolve, reject) => {
      const request = indexedDB.open(
         DATABASE_NAME,
         DATABASE_VERSION
      );

      request.onerror = () => {
         updateDatabaseStatus("Database failed to open.");
         reject(request.error);
      };

      request.onsuccess = () => {
         db = request.result;

         updateDatabaseStatus("Database ready.");

         resolve();
      };

      request.onupgradeneeded = event => {
         const database = event.target.result;

         if (!database.objectStoreNames.contains(STORE_SETTINGS)) {
            database.createObjectStore(
               STORE_SETTINGS,
               {
                  keyPath: "id"
               }
            );
         }

         if (!database.objectStoreNames.contains(STORE_GAME_STATE)) {
            database.createObjectStore(
               STORE_GAME_STATE,
               {
                  keyPath: "id"
               }
            );
         }

         if (!database.objectStoreNames.contains(STORE_STATISTICS)) {
            database.createObjectStore(
               STORE_STATISTICS,
               {
                  keyPath: "id"
               }
            );
         }

         if (!database.objectStoreNames.contains(STORE_ACHIEVEMENTS)) {
            database.createObjectStore(
               STORE_ACHIEVEMENTS,
               {
                  keyPath: "id"
               }
            );
         }

         if (!database.objectStoreNames.contains(STORE_COIN_BANK)) {
            database.createObjectStore(
               STORE_COIN_BANK,
               {
                  keyPath: "id"
               }
            );
         }

         if (!database.objectStoreNames.contains(STORE_COLLECTIBLES)) {
            database.createObjectStore(
               STORE_COLLECTIBLES,
               {
                  keyPath: "id"
               }
            );
         }

         if (!database.objectStoreNames.contains(STORE_STORE_INVENTORY)) {
            database.createObjectStore(
               STORE_STORE_INVENTORY,
               {
                  keyPath: "id"
               }
            );
         }
      };
   });
}

/* <------------------------------------------------
      DATABASE HELPERS
   -------------------------------------------------> */
function updateDatabaseStatus(message) {
   const databaseStatus =
      document.getElementById("databaseStatus");

   if (!databaseStatus) {
      return;
   }

   databaseStatus.textContent = message;
}

function databaseReady() {
   return db !== null;
}

function saveRecord(storeName, record) {
   if (!databaseReady()) {
      return Promise.resolve();
   }

   return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(record);

      request.onsuccess = () => {
         resolve();
      };

      request.onerror = () => {
         reject(request.error);
      };
   });
}

function loadRecord(storeName, id) {
   if (!databaseReady()) {
      return Promise.resolve(null);
   }

   return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
         resolve(request.result || null);
      };

      request.onerror = () => {
         reject(request.error);
      };
   });
}

function loadAllRecords(storeName) {
   if (!databaseReady()) {
      return Promise.resolve([]);
   }

   return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
         resolve(request.result || []);
      };

      request.onerror = () => {
         reject(request.error);
      };
   });
}

/* <------------------------------------------------
      DATABASE DEFAULT RECORDS
   -------------------------------------------------> */
async function ensureDefaultDatabaseRecords() {
   await ensureDefaultRecord(
      STORE_STATISTICS,
      STATISTICS_RECORD_ID,
      createDefaultStatistics()
   );

   await ensureDefaultRecord(
      STORE_ACHIEVEMENTS,
      ACHIEVEMENTS_RECORD_ID,
      createDefaultAchievements()
   );

   await ensureDefaultRecord(
      STORE_COIN_BANK,
      COIN_BANK_RECORD_ID,
      createDefaultCoinBank()
   );

   await ensureDefaultRecord(
      STORE_COLLECTIBLES,
      COLLECTIBLES_RECORD_ID,
      createDefaultCollectibles()
   );

   await ensureDefaultRecord(
      STORE_STORE_INVENTORY,
      STORE_INVENTORY_RECORD_ID,
      createDefaultStoreInventory()
   );
}

async function ensureDefaultRecord(storeName, recordId, defaultRecord) {
   const existingRecord = await loadRecord(
      storeName,
      recordId
   );

   if (existingRecord) {
      return;
   }

   await saveRecord(
      storeName,
      defaultRecord
   );
}

function createDefaultStatistics() {
   return {
      id: STATISTICS_RECORD_ID,
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      totalPointsScored: 0,
      totalBankedPoints: 0,
      highestTurnScore: 0,
      highestGameScore: 0,
      totalFarkles: 0,
      totalHotDice: 0,
      totalTurnsTaken: 0,
      totalDiceRolled: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
   };
}

function createDefaultAchievements() {
   return {
      id: ACHIEVEMENTS_RECORD_ID,
      unlocked: [],
      progress: {},
      availableAchievements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
   };
}

function createDefaultCoinBank() {
   return {
      id: COIN_BANK_RECORD_ID,
      balance: 0,
      lifetimeEarned: 0,
      lifetimeSpent: 0,
      transactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
   };
}

function createDefaultCollectibles() {
   return {
      id: COLLECTIBLES_RECORD_ID,
      unlocked: [],
      equipped: {
         diceSkin: null,
         tableTheme: null,
         playerBadge: null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
   };
}

function createDefaultStoreInventory() {
   return {
      id: STORE_INVENTORY_RECORD_ID,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
   };
}

/* <------------------------------------------------
      STATISTICS STORAGE
   -------------------------------------------------> */
async function loadStatistics() {
   const statistics = await loadRecord(
      STORE_STATISTICS,
      STATISTICS_RECORD_ID
   );

   return statistics || createDefaultStatistics();
}

async function saveStatistics(statistics) {
   statistics.updatedAt = new Date().toISOString();

   await saveRecord(
      STORE_STATISTICS,
      statistics
   );
}

async function updateStatistics(updateFunction) {
   const statistics = await loadStatistics();

   updateFunction(statistics);

   await saveStatistics(statistics);
}

/* <------------------------------------------------
      ACHIEVEMENT STORAGE
   -------------------------------------------------> */
async function loadAchievements() {
   const achievements = await loadRecord(
      STORE_ACHIEVEMENTS,
      ACHIEVEMENTS_RECORD_ID
   );

   return achievements || createDefaultAchievements();
}

async function saveAchievements(achievements) {
   achievements.updatedAt = new Date().toISOString();

   await saveRecord(
      STORE_ACHIEVEMENTS,
      achievements
   );
}

/* <------------------------------------------------
      ACHIEVEMENT DEFINITIONS
   -------------------------------------------------> */
const ACHIEVEMENT_DEFINITIONS = [];

/* <------------------------------------------------
      COIN BANK STORAGE
   -------------------------------------------------> */
async function loadCoinBank() {
   const coinBank = await loadRecord(
      STORE_COIN_BANK,
      COIN_BANK_RECORD_ID
   );

   return coinBank || createDefaultCoinBank();
}

async function saveCoinBank(coinBank) {
   coinBank.updatedAt = new Date().toISOString();

   await saveRecord(
      STORE_COIN_BANK,
      coinBank
   );
}

async function updateCoinBank(updateFunction) {
   const coinBank = await loadCoinBank();

   updateFunction(coinBank);

   await saveCoinBank(coinBank);
}

async function addCoinTransaction({
   type,
   amount,
   description
}) {
   await updateCoinBank(coinBank => {
      coinBank.transactions.push({
         timestamp: new Date().toISOString(),
         type,
         amount,
         description
      });

      if (type === "earned") {
         coinBank.balance += amount;
         coinBank.lifetimeEarned += amount;
      }

      if (type === "spent") {
         coinBank.balance -= amount;
         coinBank.lifetimeSpent += amount;
      }
   });
}

/* <------------------------------------------------
      STORE INVENTORY STORAGE
   -------------------------------------------------> */
async function loadStoreInventory() {
   const storeInventory = await loadRecord(
      STORE_STORE_INVENTORY,
      STORE_INVENTORY_RECORD_ID
   );

   return storeInventory || createDefaultStoreInventory();
}

async function saveStoreInventory(storeInventory) {
   storeInventory.updatedAt = new Date().toISOString();

   await saveRecord(
      STORE_STORE_INVENTORY,
      storeInventory
   );
}

/* <------------------------------------------------
      COLLECTIBLES STORAGE
   -------------------------------------------------> */
async function loadCollectibles() {
   const collectibles = await loadRecord(
      STORE_COLLECTIBLES,
      COLLECTIBLES_RECORD_ID
   );

   return collectibles || createDefaultCollectibles();
}

async function saveCollectibles(collectibles) {
   collectibles.updatedAt = new Date().toISOString();

   await saveRecord(
      STORE_COLLECTIBLES,
      collectibles
   );
}

/* <------------------------------------------------
      SETTINGS STORAGE
   -------------------------------------------------> */
function saveSettings() {
   return saveRecord(
      STORE_SETTINGS,
      {
         id: SETTINGS_RECORD_ID,
         playerName: state.playerName,
         theme: optionsThemeSelect.value,
         savedAt: new Date().toISOString()
      }
   );
}

async function loadSettings() {
   const savedSettings = await loadRecord(
      STORE_SETTINGS,
      SETTINGS_RECORD_ID
   );

   if (!savedSettings) {
      return;
   }

   state.playerName = savedSettings.playerName || "Player";
   optionsPlayerNameInput.value = state.playerName;

   if (savedSettings.theme) {
      optionsThemeSelect.value = savedSettings.theme;
      document.body.className = `${savedSettings.theme} app-loading`;
   }
}

/* <------------------------------------------------
      STATE CREATION
   -------------------------------------------------> */
function createInitialState() {
   return {
      playerName: "Player",
      scores: {
         player: 0,
         ai: 0
      },
      currentPlayer: "player",
      turnScore: 0,
      dice: Array.from({ length: DICE_COUNT }, () => ({
         value: 1,
         locked: false,
         selected: false
      })),
      hasRolled: false,
      canRoll: true,
      gameOver: false,
      finalRoundStartedBy: null,
      playerTurnsTaken: {
         player: 0,
         ai: 0
      },
      onTheBoard: {
         player: false,
         ai: false
      }
   };
}

/* <------------------------------------------------
      FULL GAME SCREEN SCALING
   -------------------------------------------------> */
function scaleGameToScreen() {
   const widthPadding = 24;
   const heightPadding = 24;
   const availableWidth = window.innerWidth - widthPadding;
   const availableHeight = window.innerHeight - heightPadding;
   const appWidth = app.offsetWidth;
   const appHeight = app.offsetHeight;
   const scale = Math.min(1, availableWidth / appWidth, availableHeight / appHeight);

   document.documentElement.style.setProperty("--game-scale", scale);
}

/* <------------------------------------------------
      GAME SNAPSHOT STORAGE
   -------------------------------------------------> */
function createGameSnapshot() {
   return {
      id: GAME_STATE_RECORD_ID,
      snapshotVersion: GAME_SNAPSHOT_VERSION,
      appVersion: APP_VERSION,
      state: structuredClone(state),
      logItems: getLogItems(),
      savedAt: new Date().toISOString()
   };
}

function saveGameState() {
   return saveRecord(
      STORE_GAME_STATE,
      createGameSnapshot()
   );
}

async function loadGameState() {
   const savedGame = await loadRecord(
      STORE_GAME_STATE,
      GAME_STATE_RECORD_ID
   );

   if (!isValidGameSnapshot(savedGame)) {
      return false;
   }

   state = savedGame.state;
   restoreLogItems(savedGame.logItems || []);

   return true;
}

function isValidGameSnapshot(savedGame) {
   if (!savedGame || !savedGame.state) {
      return false;
   }

   if (savedGame.snapshotVersion !== GAME_SNAPSHOT_VERSION) {
      return false;
   }

   if (!Array.isArray(savedGame.state.dice)) {
      return false;
   }

   if (!savedGame.state.scores || typeof savedGame.state.scores.player !== "number" || typeof savedGame.state.scores.ai !== "number") {
      return false;
   }

   return true;
}

function getLogItems() {
   return Array.from(logList.children).map(item => item.textContent);
}

function restoreLogItems(items) {
   logList.innerHTML = "";

   items
      .slice()
      .reverse()
      .forEach(message => {
         const item = document.createElement("div");

         item.className = "log-item";
         item.textContent = message;
         logList.prepend(item);
      });
}

/* <------------------------------------------------
      DICE DISPLAY
   -------------------------------------------------> */
function buildDice() {
   diceTable.innerHTML = "";

   state.dice.forEach((die, index) => {
      const button = document.createElement("button");

      button.className = "die";
      button.type = "button";
      button.dataset.index = index;
      button.dataset.value = die.value;
      button.setAttribute("aria-label", `Die ${index + 1}, value ${die.value}`);
      button.innerHTML = `<div class="pips">${Array.from({ length: 9 }, () => '<span class="pip"></span>').join("")}</div>`;
      button.addEventListener("click", () => toggleDieSelection(index));

      diceTable.appendChild(button);
   });
}

/* <------------------------------------------------
      SCREEN RENDERING
   -------------------------------------------------> */
function render() {
   const displayName = state.playerName || "Player";

   playerNameLabel.textContent = displayName;
   playerScoreEl.textContent = state.scores.player.toLocaleString();
   aiScoreEl.textContent = state.scores.ai.toLocaleString();
   turnScoreEl.textContent = getPreviewTurnScore().toLocaleString();

   playerCard.classList.toggle("active", state.currentPlayer === "player");
   aiCard.classList.toggle("active", state.currentPlayer === "ai");

   turnTitle.textContent = state.currentPlayer === "player" ? `${displayName}'s Turn` : "AI Opponent Turn";

   document.querySelectorAll(".die").forEach((button, index) => {
      const die = state.dice[index];

      button.dataset.value = die.value;
      button.classList.toggle("selected", die.selected);
      button.classList.toggle("locked", die.locked);
      button.disabled = state.currentPlayer === "ai" || die.locked || !state.hasRolled || state.gameOver;
      button.setAttribute("aria-label", `Die ${index + 1}, value ${die.value}${die.locked ? ", kept" : ""}`);
   });

   updateSelectionReadout();
   updateOnTheBoardMessage();
   updateButtonStates();
}

/* <------------------------------------------------
      PLAYER SELECTION DISPLAY
   -------------------------------------------------> */
function updateSelectionReadout() {
   const selectedValues = getSelectedDice().map(die => die.value);
   const selectedResult = scoreDice(selectedValues);

   if (state.currentPlayer !== "player" || !state.hasRolled || selectedValues.length === 0) {
      return;
   }

   if (selectedResult.score > 0 && selectedResult.usesAllDice) {
      selectionReadout.innerHTML = `Selected dice score <strong>${selectedResult.score.toLocaleString()}</strong>. Keep them or change your selection.`;
      return;
   }

   selectionReadout.textContent = "Selected dice are not a complete scoring combination. Choose only dice that score.";
}

function updateOnTheBoardMessage() {
   const shouldShowMessage =
      state.currentPlayer === "player" &&
      currentPlayerNeedsOnTheBoard() &&
      !state.gameOver;

   onTheBoardMessage.classList.toggle("show", shouldShowMessage);
}

function updateButtonStates() {
   const selectedValues = getSelectedDice().map(die => die.value);
   const selectedResult = scoreDice(selectedValues);
   const selectedIsValid = selectedValues.length > 0 && selectedResult.score > 0 && selectedResult.usesAllDice;
   const hasBankablePoints = state.turnScore > 0 || selectedIsValid;

   rollBtn.disabled = state.gameOver || state.currentPlayer === "ai" || (!state.canRoll && !selectedIsValid);
   bankBtn.disabled = state.currentPlayer !== "player" || !hasBankablePoints || state.gameOver || (currentPlayerNeedsOnTheBoard() && !currentPlayerHasOpeningScore());
}

function getSelectedDice() {
   return state.dice.filter(die => die.selected && !die.locked);
}

function getPreviewTurnScore() {
   const selectedValues = getSelectedDice().map(die => die.value);
   const selectedResult = scoreDice(selectedValues);

   if (selectedValues.length > 0 && selectedResult.score > 0 && selectedResult.usesAllDice) {
      return state.turnScore + selectedResult.score;
   }

   return state.turnScore;
}

function toggleDieSelection(index) {
   if (state.currentPlayer !== "player" || state.gameOver || !state.hasRolled) {
      return;
   }

   if (state.dice[index].locked) {
      return;
   }

   state.dice[index].selected = !state.dice[index].selected;
   render();
}

/* <------------------------------------------------
      DICE ROLLING
   -------------------------------------------------> */
function rollDice() {
   if (state.gameOver) {
      return;
   }

   if (!state.canRoll && state.currentPlayer === "player") {
      const selectedWasKept = commitSelectedDice();

      if (!selectedWasKept) {
         return;
      }
   }

   if (!state.canRoll) {
      return;
   }

   state.hasRolled = true;
   state.canRoll = false;
   selectionReadout.textContent = state.currentPlayer === "player" ? "Rolling..." : "AI is rolling...";
   statusText.textContent = "Dice are rolling...";

   const availableIndexes = state.dice
      .map((die, index) => die.locked ? null : index)
      .filter(index => index !== null);
			
   updateStatistics(statistics => {
      statistics.totalDiceRolled += availableIndexes.length;
   });			

   const shuffleTimers = startDiceFaceShuffle(availableIndexes);

   document.querySelectorAll(".die").forEach((button, index) => {
      if (availableIndexes.includes(index)) {
         button.classList.add("rolling");
      }
   });

   setTimeout(() => {
      stopDiceFaceShuffle(shuffleTimers);

      availableIndexes.forEach(index => {
         state.dice[index].value = randomDieValue();
         state.dice[index].selected = false;
      });

      document.querySelectorAll(".die").forEach(button => button.classList.remove("rolling"));

      const availableValues = state.dice.filter(die => !die.locked).map(die => die.value);
      const bestScore = scoreDice(availableValues).score;

      if (bestScore === 0) {
         handleFarkle();
         return;
      }

      state.canRoll = false;
      statusText.textContent = state.currentPlayer === "player" ? "Select scoring dice, then roll again or bank." : "AI is choosing scoring dice.";
      selectionReadout.textContent = state.currentPlayer === "player" ? "Select scoring dice. The total updates before you roll or bank." : "AI is evaluating risk.";

      render();
      saveGameState();

      if (state.currentPlayer === "ai") {
         setTimeout(runAiChoice, AI_THINK_MS);
      }
   }, ROLL_ANIMATION_MS);

   render();
}

function randomDieValue() {
   return Math.floor(Math.random() * 6) + 1;
}

function startDiceFaceShuffle(indexes) {
   const timers = [];

   indexes.forEach(index => {
      const button = document.querySelector(`.die[data-index="${index}"]`);
      let delay = 45;

      function shuffleFace() {
         button.dataset.value = randomDieValue();
         delay += 22;

         if (delay <= ROLL_ANIMATION_MS) {
            timers.push(
               setTimeout(
                  shuffleFace,
                  delay
               )
            );
         }
      }

      shuffleFace();
   });

   return timers;
}

function stopDiceFaceShuffle(timers) {
   timers.forEach(timer => clearTimeout(timer));
}

/* <------------------------------------------------
      FARKLE HANDLING
   -------------------------------------------------> */
function handleFarkle() {
   document.querySelectorAll(".die:not(.locked)").forEach(button => button.classList.add("farkle-shake"));

   setTimeout(() => {
      document.querySelectorAll(".die").forEach(button => button.classList.remove("farkle-shake"));
   }, 460);

   addLog(`${getCurrentName()} Farkled and lost ${state.turnScore.toLocaleString()} turn points.`);
	 
   updateStatistics(statistics => {
      statistics.totalFarkles += 1;
   });	 

   state.turnScore = 0;
   state.canRoll = false;
   statusText.textContent = "Farkle! No scoring dice. Turn lost.";
   selectionReadout.textContent = "No scoring dice were rolled.";

   render();
   saveGameState();

   setTimeout(endTurnWithoutBanking, 900);
}

/* <------------------------------------------------
      ON THE BOARD RULE
   -------------------------------------------------> */
function currentPlayerIsOnTheBoard() {
   return state.onTheBoard[state.currentPlayer];
}

function currentPlayerNeedsOnTheBoard() {
   return !currentPlayerIsOnTheBoard();
}

function currentPlayerHasOpeningScore() {
   return getPreviewTurnScore() >= ON_THE_BOARD_SCORE;
}

/* <------------------------------------------------
      PLAYER TURN ACTIONS
   -------------------------------------------------> */
function commitSelectedDice() {
   const selectedDice = getSelectedDice();
   const selectedValues = selectedDice.map(die => die.value);
   const result = scoreDice(selectedValues);

   if (!selectedValues.length || result.score <= 0 || !result.usesAllDice) {
      return false;
   }

   selectedDice.forEach(die => {
      die.locked = true;
      die.selected = false;
   });

   state.turnScore += result.score;

   addLog(`${getCurrentName()} selected ${selectedValues.join(", ")} for ${result.score.toLocaleString()} points.`);
   prepareNextRoll();
   render();
   saveGameState();

   return true;
}

function prepareNextRoll() {
   const allLocked = state.dice.every(die => die.locked);

   if (allLocked) {
      state.dice.forEach(die => {
         die.locked = false;
         die.selected = false;
      });

      statusText.textContent = "Hot dice! All six dice scored. Roll all six again or bank.";
      selectionReadout.textContent = "Hot dice activated. All six dice are live again.";
			
      updateStatistics(statistics => {
         statistics.totalHotDice += 1;
      });			
			
   } else {
      statusText.textContent = "Roll remaining dice or bank your turn points.";
      selectionReadout.textContent = "Roll remaining dice, or bank your points safely.";
   }

   state.hasRolled = false;
   state.canRoll = true;
}

function bankPoints() {
   if (state.gameOver) {
      return;
   }

   if (state.currentPlayer === "player" && getSelectedDice().length > 0) {
      const selectedWasKept = commitSelectedDice();

      if (!selectedWasKept) {
         return;
      }
   }

   if (state.turnScore <= 0) {
      return;
   }

   if (currentPlayerNeedsOnTheBoard() && state.turnScore < ON_THE_BOARD_SCORE) {
      addLog(`${getCurrentName()} did not get on the board.`);
      return;
   }

   if (currentPlayerNeedsOnTheBoard()) {
      state.onTheBoard[state.currentPlayer] = true;
      addLog(`${getCurrentName()} is on the board with ${state.turnScore.toLocaleString()} points.`);
   }

   state.scores[state.currentPlayer] += state.turnScore;

   updateStatistics(statistics => {
      statistics.totalPointsScored += state.turnScore;
      statistics.totalBankedPoints += state.turnScore;
      statistics.highestTurnScore = Math.max(
         statistics.highestTurnScore,
         state.turnScore
      );
      statistics.highestGameScore = Math.max(
         statistics.highestGameScore,
         state.scores[state.currentPlayer]
      );
   });

   addLog(`${getCurrentName()} banked ${state.turnScore.toLocaleString()} points.`);

   if (!state.finalRoundStartedBy && state.scores[state.currentPlayer] >= WINNING_SCORE) {
      state.finalRoundStartedBy = state.currentPlayer;
      addLog(`${getCurrentName()} reached 10,000. Final round triggered.`);
   }

   saveGameState();
   finishTurn();
}

/* <------------------------------------------------
      TURN FLOW
   -------------------------------------------------> */
function finishTurn() {
   state.playerTurnsTaken[state.currentPlayer] += 1;

   if (shouldEndGame()) {
      showWinner();
      return;
   }

   switchTurn();
}

function endTurnWithoutBanking() {
   state.playerTurnsTaken[state.currentPlayer] += 1;

   if (shouldEndGame()) {
      showWinner();
      return;
   }

   switchTurn();
}

function shouldEndGame() {
   if (!state.finalRoundStartedBy) {
      return false;
   }

   return state.playerTurnsTaken.player === state.playerTurnsTaken.ai;
}

function switchTurn() {
   updateStatistics(statistics => {
      statistics.totalTurnsTaken += 1;
   });	
   state.currentPlayer = state.currentPlayer === "player" ? "ai" : "player";
   state.turnScore = 0;
   state.hasRolled = false;
   state.canRoll = true;
   state.dice = Array.from({ length: DICE_COUNT }, () => ({
      value: 1,
      locked: false,
      selected: false
   }));

   statusText.textContent = state.currentPlayer === "player" ? "Roll all six dice to begin your turn." : "AI turn begins.";
   selectionReadout.textContent = state.currentPlayer === "player" ? "Roll all six dice to begin your turn." : "AI is ready to roll.";

   buildDice();
   render();
   scaleGameToScreen();
   saveGameState();

   if (state.currentPlayer === "ai") {
      setTimeout(rollDice, AI_THINK_MS);
   }
}

/* <------------------------------------------------
      AI TURN LOGIC
   -------------------------------------------------> */
function runAiChoice() {
   if (state.currentPlayer !== "ai" || state.gameOver) {
      return;
   }

   const available = state.dice
      .map((die, index) => ({
         ...die,
         index
      }))
      .filter(die => !die.locked);

   const choice = chooseBestAiKeep(available.map(die => die.value));
   const indexesToKeep = mapValuesToIndexes(available, choice.values);

   indexesToKeep.forEach(index => {
      state.dice[index].locked = true;
      state.dice[index].selected = false;
   });

   state.turnScore += choice.score;

   addLog(`AI selected ${choice.values.join(", ")} for ${choice.score.toLocaleString()} points.`);
   prepareNextRoll();
   render();
   scaleGameToScreen();

   if (shouldAiBank()) {
      setTimeout(bankPoints, AI_THINK_MS);
      return;
   }

   setTimeout(rollDice, AI_THINK_MS);
}

function chooseBestAiKeep(values) {
   const subsets = getAllSubsets(values);
   let best = {
      values: [],
      score: 0
   };

   subsets.forEach(subset => {
      const result = scoreDice(subset);

      if (result.score > best.score && result.usesAllDice) {
         best = {
            values: subset,
            score: result.score
         };
      }
   });

   return best;
}

function mapValuesToIndexes(availableDice, valuesToKeep) {
   const indexes = [];
   const used = new Set();

   valuesToKeep.forEach(value => {
      const found = availableDice.find(die => die.value === value && !used.has(die.index));

      if (found) {
         indexes.push(found.index);
         used.add(found.index);
      }
   });

   return indexes;
}

function shouldAiBank() {
   const aiTotalIfBanked = state.scores.ai + state.turnScore;
   const playerLead = state.scores.player - state.scores.ai;
   const unlockedCount = state.dice.filter(die => !die.locked).length || DICE_COUNT;

   if (!state.onTheBoard.ai && state.turnScore < ON_THE_BOARD_SCORE) {
      return false;
   }

   if (aiTotalIfBanked >= WINNING_SCORE) {
      return true;
   }

   if (state.turnScore >= 1000) {
      return true;
   }

   if (state.turnScore >= 750 && unlockedCount <= 3) {
      return true;
   }

   if (state.turnScore >= 500 && playerLead < 1000 && unlockedCount <= 2) {
      return true;
   }

   if (playerLead > 1800 && state.turnScore < 1200) {
      return false;
   }

   return state.turnScore >= 650 && unlockedCount <= 4;
}

/* <------------------------------------------------
      SCORING SYSTEM
   -------------------------------------------------> */
function scoreDice(values) {
   if (!values.length) {
      return {
         score: 0,
         usesAllDice: false
      };
   }

   const counts = countValues(values);
   const sortedCounts = Object.values(counts).sort((a, b) => b - a);
   const uniqueFaces = Object.keys(counts).length;

   if (values.length === DICE_COUNT) {
      if (uniqueFaces === 6) {
         return {
            score: 1500,
            usesAllDice: true,
            label: "Straight"
         };
      }

      if (sortedCounts.length === 3 && sortedCounts.every(count => count === 2)) {
         return {
            score: 1500,
            usesAllDice: true,
            label: "Three Pairs"
         };
      }

      if (sortedCounts.length === 2 && sortedCounts.every(count => count === 3)) {
         return {
            score: 2500,
            usesAllDice: true,
            label: "Two Triplets"
         };
      }

      if (sortedCounts[0] === 6) {
         return {
            score: 3000,
            usesAllDice: true,
            label: "Six of a Kind"
         };
      }
   }

   let score = 0;
   let usedDice = 0;

   for (let face = 1; face <= 6; face += 1) {
      const count = counts[face] || 0;

      if (count >= 3) {
         const base = face === 1 ? 1000 : face * 100;

         score += base * Math.pow(2, count - 3);
         usedDice += count;
      } else if (face === 1) {
         score += count * 100;
         usedDice += count;
      } else if (face === 5) {
         score += count * 50;
         usedDice += count;
      }
   }

   return {
      score,
      usesAllDice: usedDice === values.length
   };
}

function countValues(values) {
   return values.reduce((counts, value) => {
      counts[value] = (counts[value] || 0) + 1;
      return counts;
   }, {});
}

function getAllSubsets(values) {
   const subsets = [];
   const total = Math.pow(2, values.length);

   for (let mask = 1; mask < total; mask += 1) {
      const subset = [];

      values.forEach((value, index) => {
         if (mask & (1 << index)) {
            subset.push(value);
         }
      });

      subsets.push(subset);
   }

   return subsets;
}

/* <------------------------------------------------
      GAME LOG
   -------------------------------------------------> */
function getCurrentName() {
   return state.currentPlayer === "player" ? state.playerName : "AI";
}

function addLog(message) {
   const item = document.createElement("div");

   item.className = "log-item";
   item.textContent = message;
   logList.prepend(item);

   while (logList.children.length > 40) {
      logList.removeChild(logList.lastChild);
   }

   scaleGameToScreen();
}

/* <------------------------------------------------
      WINNER DISPLAY
   -------------------------------------------------> */
function showWinner() {
   state.gameOver = true;

   const playerWon = state.scores.player >= state.scores.ai;
   const winnerName = playerWon ? state.playerName : "AI Opponent";
	 
   updateStatistics(statistics => {
      statistics.gamesPlayed += 1;

      if (playerWon) {
         statistics.gamesWon += 1;
      } else {
         statistics.gamesLost += 1;
      }
   });	 

   winnerTitle.textContent = `${winnerName} Wins!`;
   winnerText.textContent = `Final score: ${state.playerName} ${state.scores.player.toLocaleString()} - AI ${state.scores.ai.toLocaleString()}.`;

   winnerModal.classList.add("show");
   launchConfetti();
   render();
   scaleGameToScreen();
}

function launchConfetti() {
   confetti.innerHTML = "";

   for (let i = 0; i < 80; i += 1) {
      const piece = document.createElement("span");

      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDelay = `${Math.random() * 500}ms`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      piece.style.background = i % 2 === 0 ? "var(--accent)" : "var(--accent-2)";

      confetti.appendChild(piece);
   }

   setTimeout(() => {
      confetti.innerHTML = "";
   }, 1900);
}

/* <------------------------------------------------
      BACKUP GUIDE WINDOWS
   -------------------------------------------------> */
function openShareGuide() {
   shareGuideModal.classList.add("show");
}

function closeShareGuide() {
   shareGuideModal.classList.remove("show");
}

function openImportGuide() {
   importGuideModal.classList.add("show");
}

function closeImportGuide() {
   importGuideModal.classList.remove("show");
}

/* <------------------------------------------------
      BACKUP EXPORT / IMPORT
   -------------------------------------------------> */
async function createFullDatabaseBackup() {
   const stores = {};

   for (const storeName of DATABASE_BACKUP_STORES) {
      stores[storeName] = await loadAllRecords(storeName);
   }

   return {
      backupType: "fullDatabase",
      backupVersion: 1,
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      stores
   };
}	 
	 
async function createBackupData() {
   await saveSettings();
   await saveGameState();

   return createFullDatabaseBackup();
}

async function exportBackup() {
   const backupData = await createBackupData();

   const blob = new Blob(
      [
         JSON.stringify(
            backupData,
            null,
            3
         )
      ],
      {
         type: "application/json"
      }
   );

   const url = URL.createObjectURL(blob);
   const link = document.createElement("a");

   link.href = url;
   link.download = "farkle-backup.json";
   link.click();

   URL.revokeObjectURL(url);

   addLog("Backup exported.");
}

async function shareBackup() {
   const backupData = await createBackupData();

   const backupFile = new File(
      [
         JSON.stringify(
            backupData,
            null,
            3
         )
      ],
      "farkle-backup.json",
      {
         type: "application/json"
      }
   );

   try {
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [backupFile] })) {
         await navigator.share({
            title: APP_TITLE,
            text: "Farkle backup file",
            files: [backupFile]
         });

         addLog("Backup shared.");
         return;
      }

         alert("Native sharing is not available in this browser or testing mode. A backup file will download instead.");
         await exportBackup();
   } catch (error) {
      if (error.name !== "AbortError") {
         alert("Sharing failed. A backup file will download instead.");
         await exportBackup();
      }
   }
}

function isFullDatabaseBackup(backupData) {
   return (
      backupData &&
      backupData.backupType === "fullDatabase" &&
      backupData.stores &&
      typeof backupData.stores === "object"
   );
}

async function restoreFullDatabaseBackup(backupData) {
   for (const storeName of DATABASE_BACKUP_STORES) {
      const records = backupData.stores[storeName] || [];

      for (const record of records) {
         await saveRecord(
            storeName,
            record
         );
      }
   }
}

async function importBackupFile(file) {
   const text = await file.text();

   let backupData;

   try {
      backupData = JSON.parse(text);
   } catch {
      alert("Invalid backup file.");
      return;
   }

   if (isFullDatabaseBackup(backupData)) {
      await restoreFullDatabaseBackup(backupData);
      location.reload();
      return;
   }

   if (
      !backupData ||
      !backupData.gameSnapshot ||
      !backupData.gameSnapshot.state
   ) {
      alert("Backup file is not valid.");
      return;
   }

   await saveRecord(
      STORE_GAME_STATE,
      backupData.gameSnapshot
   );

   location.reload();
}

/* <------------------------------------------------
      GAME RESET
   -------------------------------------------------> */
function newGame() {
   const previousName = state.playerName || "Player";

   state = createInitialState();
   state.playerName = previousName;
   logList.innerHTML = "";
   winnerModal.classList.remove("show");
   helpModal.classList.remove("show");

   buildDice();
   addLog("New game started. First to 10,000 wins.");

   selectionReadout.textContent = "Select scoring dice after a roll.";

   render();
   scaleGameToScreen();
   saveGameState();
}

/* <------------------------------------------------
      RESTORED GAME RESUME
   -------------------------------------------------> */
function resumeRestoredGame() {
   if (state.gameOver) {
      render();
      scaleGameToScreen();
      return;
   }

   if (state.currentPlayer === "ai" && state.canRoll) {
      setTimeout(rollDice, AI_THINK_MS);
   }

   render();
   scaleGameToScreen();
   document.body.classList.remove("app-loading");
}

/* <------------------------------------------------
      INITIALIZATION
   -------------------------------------------------> */
async function init() {
   await initializeDatabase();
   await ensureDefaultDatabaseRecords();
   await loadSettings();

   const restoredGame = await loadGameState();

   if (!restoredGame) {
      buildDice();
      addLog("New game started. First to 10,000 wins.");
      saveGameState();
   } else {
      buildDice();
   }

   optionsPlayerNameInput.addEventListener("input", event => {
      state.playerName = event.target.value.trim() || "Player";
      render();
      scaleGameToScreen();
      saveSettings();
      saveGameState();
   });

   optionsThemeSelect.addEventListener("change", event => {
      document.body.className = event.target.value;
      scaleGameToScreen();
      saveSettings();
   });

   rollBtn.addEventListener("click", rollDice);
   bankBtn.addEventListener("click", bankPoints);
   optionsBtn.addEventListener("click", () => optionsModal.classList.add("show"));
   closeOptionsBtn.addEventListener("click", () => optionsModal.classList.remove("show"));
   newGameOptionBtn.addEventListener("click", () => {
      optionsModal.classList.remove("show");
      newGame();
   });
   helpBtn.addEventListener("click", () => helpModal.classList.add("show"));
   closeHelpBtn.addEventListener("click", () => helpModal.classList.remove("show"));
   playAgainBtn.addEventListener("click", newGame);

   exportBackupOptionBtn.addEventListener(
      "click",
      async () => {
         optionsModal.classList.remove("show");
         await exportBackup();
      }
   );

   importBackupOptionBtn.addEventListener(
      "click",
      () => {
         optionsModal.classList.remove("show");
         openImportGuide();
      }
   );

   shareBackupOptionBtn.addEventListener(
      "click",
      () => {
         optionsModal.classList.remove("show");
         openShareGuide();
      }
   );

   continueShareBtn.addEventListener(
      "click",
      async () => {
         closeShareGuide();
         await shareBackup();
      }
   );

   cancelShareBtn.addEventListener(
      "click",
      closeShareGuide
   );

   continueImportBtn.addEventListener(
      "click",
      () => {
         closeImportGuide();
         backupFileInput.click();
      }
   );

   cancelImportBtn.addEventListener(
      "click",
      closeImportGuide
   );

   backupFileInput.addEventListener(
      "change",
      event => {
         const file = event.target.files[0];

         if (!file) {
            return;
         }

         importBackupFile(file);
      }
   );

   window.addEventListener("resize", scaleGameToScreen);

   resumeRestoredGame();
}

init();