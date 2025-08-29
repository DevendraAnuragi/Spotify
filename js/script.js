console.log("Lets write Javascript")
let currentSong = new Audio();
let songs;
let currFolder;

function formatSecondsToMinSec(seconds) {
    if (typeof seconds !== 'number' || !isFinite(seconds) || seconds < 0) {
        return '00:00';
    }
    // Drop any decimal part
    const totalSeconds = Math.floor(seconds);

    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    // Pad seconds with leading zero if less than 10
    const paddedSecs = secs.toString().padStart(2, '0');

    return `${mins}:${paddedSecs}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://10.145.218.23:5500/videospotify/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // Play the first song of the play music
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ").replace("http://10.145.218.23:5500/videospotify/songs/", "")}</div>
                                <div>Devendra</div>
                            </div>
                            <div class="play-now">
                                <span>Play Now</span>
                            <img class="invert" src="img/play.svg" alt="Play Now">
                            </div>
                        
          </li>`;
    }
    // Attach an event listener to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })

    })
    return songs
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/videospotify/songs/" + track)
    currentSong.src = `${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"
    }
    else {
        currentSong.pause();
        play.src = "img/play.svg";
    }



    document.querySelector(".song-info").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"
}

async function displayAlbum() {
    let a = await fetch(`http://10.145.218.23:5500/videospotify/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container")
    Array.from(anchors).forEach(async (e) => {

        if (e.href.includes("/songs")) {
            try {
                let folder = e.href.split("/").slice(5)[0];

                if (!folder) throw new Error("Folder is undefined");

                // Get the meta data of the folder
                let a = await fetch(`http://10.145.218.23:5500/videospotify/songs/${folder}/info.json`);
                let response = await a.json();
                console.log(response);
                cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" color="#000000" fill="none">
                                <!-- Circular green background -->
                                <!-- Translated group to simulate padding -->
                                <g transform="translate(4, 4)">
                                    <path
                                        d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                                        fill="#000000" />
                                </g>
                            </svg>
                        </div>
                        
                        <img src="/videospotify/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

            } catch (err) {
                console.warn("Skipping link due to error:", e.href, err.message);
            }
        }
        // Load a playlist when the card is clicked
        setTimeout(() => {
            Array.from(document.getElementsByClassName("card")).forEach(card => {
                card.addEventListener("click", async item => {
                    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                    playMusic(songs[0])

                })
            })
        });
    }, 500);

}


async function main() {


    // Get the lists of all the songs   
    songs = await getSongs("songs/cs")
    playMusic(songs[0], true)

    // Display Album functions
    displayAlbum();


    // Attach an event Listener to play next previous and play 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })

    // Listen for Timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${formatSecondsToMinSec(currentSong.currentTime)}/${formatSecondsToMinSec(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    // Add an eventListender to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    // Add an event Listener for Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    // Add an event Listener to close Hamburfer
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })
    // Add previous and Previous    
    previous.addEventListener("click", () => {
        console.log("Previous clicked")
        console.log(currentSong.src)
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    // Add previous and next 
    next.addEventListener("click", () => {
        console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    // Add an event to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to ", e.target.value, " /100");
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // Add evenlistener to mute the volume 
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

        }
    })

}
main()