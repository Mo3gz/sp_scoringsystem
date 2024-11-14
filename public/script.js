let isAuthorized = false;
let teams = [];

async function updateScoreOnServer(teamNumber, newScore) {
  try {
      const response = await fetch(`/api/scores/${teamNumber}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ score: newScore })
      });

      if (response.ok) {
          console.log(`Score updated for team ${teamNumber}`);
          renderTeams(); // Refresh the scoreboard to reflect the updated score
      } else {
          console.error('Failed to update score.');
      }
  } catch (error) {
      console.error('Error updating score:', error);
  }
}


// Fetch the teams and scores from the backend
async function getTeams() {
    const response = await fetch("/api/scores");
    if (response.ok) {
        teams = await response.json();
        console.log(teams);
        renderTeams();
    } else {
        alert("Failed to load teams.");
    }
}

// Dynamically render the teams and their scores
function renderTeams() {
    const scoreboard = document.getElementById("scoreboard");
    scoreboard.innerHTML = ""; 

    teams.forEach((team, index) => {
        const teamDiv = document.createElement("div");
        teamDiv.classList.add("team");
        teamDiv.id = `team${team.teamNumber}`;

        const teamHTML = `
            <h2>${team.teamNumber}</h2>
            <div class="battery">
                <img alt="Battery" class="battery-icon" id="batteryIcon${team.teamNumber}" src="${getBatteryIcon(team.score)}">
            </div>
            <button onclick="increaseScore(${team.teamNumber})">+5</button>
            <button onclick="decreaseScore(${team.teamNumber})">-5</button>
            <p>Score: <span id="score${team.teamNumber}">${team.score}</span></p>
        `;
        teamDiv.innerHTML = teamHTML;
        scoreboard.appendChild(teamDiv);
    });
}

// Get the correct battery icon based on the score
function getBatteryIcon(score) {
    if (score === 100) return "Images/battery-4.png";
    if (score >= 70) return "Images/battery-3.png";
    if (score >= 50) return "Images/battery-2.png";
    if (score > 25) return "Images/battery-1.png";
    return "Images/battery-0.png";
}

function checkAuth() {
  const authInput = document.getElementById("authInput").value;
  const errorMessage = document.getElementById("errorMessage");

  if (authInput === "aymoon") {
      isAuthorized = true;
      errorMessage.textContent = "Access granted! You can now adjust scores.";
      errorMessage.classList.remove("error-text");
      errorMessage.classList.add("success-text");
  } else {
      isAuthorized = false;
      errorMessage.textContent = "Access denied! Only admins can adjust scores.";
      errorMessage.classList.remove("success-text");
      errorMessage.classList.add("error-text");
  }
}


// Update score for a team
// Dynamically render the teams and their scores
function renderTeams() {
  const scoreboard = document.getElementById("scoreboard");
  scoreboard.innerHTML = ""; // Clear the scoreboard before rendering

  teams.forEach((team, index) => {
      const teamDiv = document.createElement("div");
      teamDiv.classList.add("team");
      teamDiv.id = `team${team.teamNumber}`;

      const teamHTML = `
          <h2>${team.teamName}</h2> <!-- Update to display teamName -->
          <div class="battery">
              <img alt="Battery" class="battery-icon" id="batteryIcon${team.teamNumber}" src="${getBatteryIcon(team.score)}">
          </div>
          <button onclick="increaseScore(${team.teamNumber})">+5</button>
          <button onclick="decreaseScore(${team.teamNumber})">-5</button>
          <p>Score: <span id="score${team.teamNumber}">${team.score}</span></p>
      `;
      teamDiv.innerHTML = teamHTML;
      scoreboard.appendChild(teamDiv);
  });
}

// Increase score by 5
async function increaseScore(teamNumber) {
  const team = teams.find(t => t.teamNumber === teamNumber);
  if (team && isAuthorized && team.score < 100) {
      team.score += 5;
      await updateScoreOnServer(teamNumber, team.score);
      renderTeams(); // Refresh the scoreboard
  }else if (!isAuthorized) {
    errorMessage.textContent = "Access denied! Only admins can adjust scores.";
  }
}

// Decrease score by 5
async function decreaseScore(teamNumber) {
  const team = teams.find(t => t.teamNumber === teamNumber);
  if (team && isAuthorized && team.score > 0) {
      team.score -= 5;
      await updateScoreOnServer(teamNumber, team.score);
      renderTeams(); // Refresh the scoreboard
  }else if (!isAuthorized) {
    errorMessage.textContent = "Access denied! Only admins can adjust scores.";
  }
}



// Initial data fetch
getTeams();