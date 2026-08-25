// ======================================
// DETTBARN BOARD GAME HALL OF FAME
// Google Sheets Integration
// ======================================


// ==============================
// Google Sheet Information
// ==============================

const spreadsheetID = "10BL2PoUMp0mM_vnQ2s9bsljhj1StyWF3mTEgTZYyhFE";

const sheetName = "Records";

const sheetURL =
`https://docs.google.com/spreadsheets/d/${spreadsheetID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;



// ==============================
// Display Settings
// ==============================

const recordsPerPage = 6;

const displayTime = 15;

const refreshTime = 300000; // 5 minutes in milliseconds



// ==============================
// Variables
// ==============================

let records = [];

let currentIndex = 0;

let countdown = displayTime;



// ==============================
// HTML Elements
// ==============================

const cards = document.querySelectorAll(".record-card");

const recordCount = document.getElementById("record-count");

const nextUpdate = document.getElementById("next-update");

const progressBar = document.getElementById("progress-bar");



// ==============================
// Format Google Sheet Dates
// ==============================

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }


    // Convert Google date format
    if (dateValue.startsWith("Date(")) {

        const parts = dateValue
            .replace("Date(", "")
            .replace(")", "")
            .split(",");


        const year = parts[0];

        // Google months start at 0
        const month = Number(parts[1]) + 1;

        const day = parts[2];


        return `${month}/${day}/${year}`;

    }


    return dateValue;

}

// ==============================
// Load Google Sheet Data
// ==============================

async function loadRecords() {

    try {

        const response = await fetch(sheetURL);

        const text = await response.text();


        // Remove Google's wrapper text

        const json = JSON.parse(
            text.substring(
                text.indexOf("{"),
                text.lastIndexOf("}") + 1
            )
        );


        const rows = json.table.rows;


        records = rows.map(row => {


            return {

                game:
                row.c[0]?.v || "",


                players:
                row.c[1]?.v || "",


                winner:
                row.c[2]?.v || "",


                score:
                row.c[3]?.v || "",


                date:
                formatDate(row.c[4]?.v || "")

            };


        });


        console.log("Loaded Records:", records);


        displayRecords();

        currentIndex = 0;
        countdown = displayTime;


    }

    catch(error) {

        console.error(
            "Could not load Google Sheet:",
            error
        );

    }

}



// ==============================
// Display Records
// ==============================

function displayRecords() {


    cards.forEach((card,index)=>{


        const record =
        records[currentIndex + index];


        if(record){


            card.querySelector(".game").textContent =
            record.game;


            card.querySelector(".score").textContent =
            record.score;


            card.querySelector(".winner").textContent =
            "👑 " + record.winner;


            card.querySelector(".details").innerHTML =
            "👥 " + record.players + " Players<br>" +
            "📅 " + record.date;


        }

        else{


            card.querySelector(".game").textContent =
            "";


            card.querySelector(".score").textContent =
            "";


            card.querySelector(".winner").textContent =
            "";


            card.querySelector(".details").textContent =
            "";


        }


    });



    const endingRecord =
    Math.min(
        currentIndex + recordsPerPage,
        records.length
    );



    recordCount.textContent =
    `Showing Records ${currentIndex + 1}–${endingRecord} of ${records.length}`;


}



// ==============================
// Change Page
// ==============================

function nextPage(){


    const grid =
    document.querySelector(".records-grid");


    grid.style.opacity = 0;



    setTimeout(()=>{


        currentIndex += recordsPerPage;



        if(currentIndex >= records.length){

            currentIndex = 0;

        }


        displayRecords();


        grid.style.opacity = 1;



    },800);


}



// ==============================
// Timer
// ==============================

function updateTimer(){


    countdown--;


    nextUpdate.textContent =
    `Next records in ${countdown} seconds`;



    progressBar.style.width =
    ((displayTime-countdown)/displayTime*100)
    +"%";



    if(countdown <= 0){


        countdown = displayTime;


        nextPage();


    }


}



// ==============================
// Start
// ==============================


loadRecords();


// Slide countdown timer
setInterval(updateTimer,1000);


// Google Sheet refresh timer
setInterval(loadRecords, refreshTime);