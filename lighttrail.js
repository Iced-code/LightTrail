
let topZIndex = 9000;

/* 
 *  Adds the LightTrail styling for comments and HUD.
 */
(function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
    .lt-selected-source {
        background-color: rgba(245, 66, 66, 0.3);
    }
    
    .lt-dialog-box {
        position: absolute;
        width: 300px;
        padding: 10px;
        padding-top: 25px;
        background-color: #fff;
        border: 1px solid #ccc;
        border-bottom: 4px solid rgb(245, 66, 66);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 5px;
        z-index: ${topZIndex};
        overflow: hidden;

        user-select: none;
    }

    .lt-other-user.lt-dialog-box {
        border-bottom: 4px solid rgb(245, 197, 66);
    }

    .lt-label {
        color: black;
        margin-bottom: 8px;
        font-size: 16px;
        font-style: italic;
        text-align: left;

        font-family: 'Jost', sans-serif;
    }

    .lt-dialog-input {
        width: 100%;
        box-sizing: border-box;
        border-radius: 4px;
        field-sizing: content;
        padding: 4px;
        resize: none;
    }

    .lt-submit-button {
        background-color: white;
        color: black;
        padding: 3px 12px;
        border-radius: 4px;

        transition: background-color 0.2s;
    }
    .lt-submit-button:hover {
        background-color: rgb(181, 181, 181);
    }
    .lt-dialog-input, .lt-submit-button {
        font-family: monospace;
    }

    .lt-close-button {
        color: red;
        float: right;
        cursor: default;

        padding: 1px;
        border-radius: 4px;
    }
    .lt-close-button:hover {
        background-color: rgb(181, 181, 181);
    }
    
    #lt-HUD {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: ${topZIndex};
        padding: 8px 18px;
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        
        font-size: 35px;
        font-weight: bold;

        background-color: #fff;
        color: black;
        border: 2px solid rgb(245, 66, 66);

        transition: background-color 0.5s;

        user-select: none;
    }
    #lt-HUD.hiding {
        background-color: rgb(245, 66, 66);
        border: 2px solid white;
    }

    #lt-HUD-window {
        height: 89%;
        width: 0px;
        position: fixed;
        top: 5px;
        right: 5px;
        overflow-x: hidden; /* Disable horizontal scroll */
        /* padding-top: 60px; */

        display: none;
        padding: 150px 20px;
        background-color: white;
        color: black;
        border-radius: 15px;
        cursor: default;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);

        z-index: ${topZIndex};
    }
    #lt-HUD.hiding #lt-HUD-window {
        display: flex;
        width: 250px;
    }
    `

    document.head.appendChild(style);
})();

const ws = new WebSocket(`ws://localhost:3000`);
ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if(data.type === 'comment_created'){
        if(data.comment.page_url === window.location.origin + window.location.pathname && data.comment.author_id !== localStorage.getItem("lt-author-id")){
            const fEvent = { pageX: data.comment.pos_x, pageY: data.comment.pos_y };
            const element = document.querySelector(data.comment.dom_path);
            const box = makeDialogBox(e=fEvent, dialogText=data.comment.selected_text, sourceElement=element, userOwns=false);

            box.dataset.commentID = data.comment.id;
            box.querySelector('textarea').value = data.comment.comment_text;
            document.body.appendChild(box);
        }
    }

    if(data.type === 'comment_deleted'){
        document.querySelectorAll('.lt-dialog-box').forEach(box => {
            if(box.dataset.commentID == data.comment.id){
                const sourceElement = document.querySelector(data.comment.dom_path);
                sourceElement.classList.remove("lt-selected-source");
                box.remove();
            }
        });
    }

    if(data.type === 'comment_updated'){
        document.querySelectorAll('.lt-dialog-box').forEach(box => {
            if(box.dataset.commentID == data.comment.id && data.comment.author_id !== localStorage.getItem("lt-author-id")) {
                box.querySelector('textarea').value = data.comment.comment_text;
                box.style.left = `${data.comment.pos_x}px`;
                box.style.top = `${data.comment.pos_y}px`;
            }
        });
    }
});

/* 
 *  Gets the parent element of the selected text.
 */
function getSelectedEl(){
    const selection = window.getSelection();
    if(selection.rangeCount > 0){
        const commonAncestor = selection.getRangeAt(0).commonAncestorContainer;

        if(commonAncestor.nodeType === Node.TEXT_NODE){
            return commonAncestor.parentNode;
        }

        return commonAncestor;
    }
    return null;
    /* var text = "";
    if(typeof window.getSelection != "undefined"){
        text = window.getSelection().toString();
    }
    return text; */
}

/*
Passed element is brought to the top of display.
*/
function bringToFront(el){
    topZIndex += 1;
    el.style.zIndex = String(topZIndex);
}

/*
Gets author id from local storage, or creates and stores it if doesn't exist.
*/
function getAuthorID(){
    let id = localStorage.getItem("lt-author-id");
    
    if(!id) {
        try {
            id = crypto.randomUUID();
        }
        catch (err){
            return "test";
        }
        localStorage.setItem("lt-author-id", id);
    }

    return id;
}

/* 
 *  Gets the DOM path for the element.
 */
function getDOMPath(el){
    if(!el) return null;

    const stack = [];

    while(el.parentNode != null){
        let siblingCount = 0;
        let siblingIndex = 0;

        for(let i = 0; i < el.parentNode.children.length; i++){
            const sibling = el.parentNode.children[i];

            if(sibling.nodeName === el.nodeName){
                if(sibling === el){
                    siblingIndex = siblingCount;
                }
                siblingCount++;
            }
        }

        const nodeName = el.nodeName.toLowerCase();

        if(siblingCount > 1){
            stack.unshift(`${nodeName}:nth-of-type(${siblingIndex+1})`)
        }
        else {
            stack.unshift(nodeName);
        }

        el = el.parentNode;
    }

    return stack.join(" > ");
}

/*
Creates popup dialog box for comments.
*/
function makeDialogBox(e, dialogText="", sourceElement, userOwns=true){
    var dialogBox = document.createElement("div");
    dialogBox.className = "lt-dialog-box";

    /*
    Marks selected element's source element.
    Highlights source elements red and adds event listener to display
    connected dialog box.
    */
    dialogBox.sourceElement = sourceElement;
    sourceElement.classList.add("lt-selected-source");
    // Clicking the source element will unhide its dialog box.
    sourceElement.addEventListener("click", () => {
        dialogBox.style.display = "initial";

        // Displays close button when dialog box's source elment clicked.
        closeBtn.disabled = false;
        closeBtn.style.display = "initial";
    });

    /*
    Dialog box styling.
    */
    Object.assign(dialogBox.style, {
        left: e.pageX + "px",
        top: (e.pageY + 10) + "px",
    });


    // --- DRAG LOGIC ---
    let isDragging = false;
    let offsetX, offsetY;
    /*
    Start dragging logic
    */
    dialogBox.addEventListener("mousedown", (e) => {
        bringToFront(dialogBox);
        closeBtn.disabled = false;
        closeBtn.style.display = "initial";

        if(e.target.tagName === "TEXTAREA" || e.target.tagName === "SPAN" || e.target.tagName === "BUTTON") return;  // so these elements can still function. 

        isDragging = true;
        dialogBox.style.cursor = "grabbing";
        // Calculate where the mouse is relative to the box's top-left corner
        offsetX = e.clientX - dialogBox.offsetLeft;
        offsetY = e.clientY - dialogBox.offsetTop;
        
        // Prevent text selection while dragging
        e.preventDefault();

        dialogBox.style.opacity = "50%";
    });
    /*
    Actual dragging around logic.
    */
    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        dialogBox.style.left = (e.clientX - offsetX) + "px";
        dialogBox.style.top = (e.clientY - offsetY) + "px";
    });
    /*
    Stop dragging logic.
    */
    document.addEventListener("mouseup", () => {
        /* if(isDragging){
            await fetch(`/comments/${commentID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    comment_text: comment,
                    pos_x: dialogBox.offsetLeft,
                    pos_y: dialogBox.offsetTop,
                })
            });
        } */
        isDragging = false;
        dialogBox.style.cursor = "auto";
        dialogBox.style.opacity = "100%";
    });

    /*
    Displays what was specifically selected by user.
    */
    const label = document.createElement("div");
    const numChars = 25;
    const labelText = dialogText.length > numChars ? dialogText.substring(0,numChars) + "..." : dialogText;
    label.className = "lt-label";
    label.innerHTML = `<strong>Selected: </strong>"<span style="color:red;">${labelText}</span>"`;  // <br>${hours}:${minutes}:${seconds}
    
    /*
    Form (Input field and submit button) for comments.
    */
    const form = document.createElement("form");

    const inputField = document.createElement("textarea");
    inputField.className = "lt-dialog-input";
    inputField.placeholder = "Type here...";
    inputField.name = "comment";

    const submitBtn = document.createElement("button");
    submitBtn.className = "lt-submit-button";
    submitBtn.type = "submit";
    submitBtn.innerText = "Comment";
    /*
    Saves comment to database.
    */
    submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const comment = inputField.value.trim();
        if(!comment) return;

        const domPath = getDOMPath(sourceElement);
        //console.log(domPath);
        
        const commentID = dialogBox.dataset.commentID;
        if(!commentID){
            // new comment being added
            const response = await fetch("http://localhost:3000/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    page_url: window.location.origin + window.location.pathname, // url without sections or params
                    dom_path: domPath,
                    selected_text: dialogText,
                    comment_text: comment,
                    pos_x: dialogBox.offsetLeft,
                    pos_y: dialogBox.offsetTop,
                    author_id: authorID
                })
            });
            const saved = await response.json();
            dialogBox.dataset.commentID = saved.id;
        }
        else {
            if(comment === ""){  // existing comment made empty, deleting comment box.
                await fetch(`http://localhost:3000/comments/${commentID}`, { method: "DELETE" });
            } 
            else {  // existing comment being updated.
                await fetch(`http://localhost:3000/comments/${commentID}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        comment_text: comment,
                        pos_x: dialogBox.offsetLeft,
                        pos_y: dialogBox.offsetTop,
                    })
                });
            }
        }

        // Hides and disables submit and close buttons when comment inputted.
        submitBtn.disabled = true;
        submitBtn.style.display = "none";

        closeBtn.disabled = true;
        closeBtn.style.display = "none";

        // loadComments();
    });

    /*
    "Close popup" button.
    */
    const closeBtn = document.createElement("span");
    closeBtn.innerText = "❌";
    closeBtn.className = "lt-close-button";
    closeBtn.addEventListener("click", async () => {
        
        const commentID = dialogBox.dataset.commentID;
        if(commentID) {
            await fetch(`http://localhost:3000/comments/${commentID}`, { method: "DELETE" });
        }

        sourceElement.classList.remove("lt-selected-source");
        dialogBox.remove();
        //loadComments();
    });


    /// If the comment is from someone other than the user, its styled accordingly and its input field is uneditable.
    if(!userOwns){   
        dialogBox.classList.add("lt-other-user");
        inputField.disabled = true;
    }
    else {
        // submit button is enabled and displayed when the input is changed.
        inputField.addEventListener("input", () => {
            submitBtn.disabled = false;
            submitBtn.style.display = "initial";
        });
    }
    form.appendChild(inputField);
    if(userOwns) {
        form.appendChild(submitBtn);
    }
    form.appendChild(closeBtn);
 
    dialogBox.appendChild(label);
    dialogBox.appendChild(form);

    return dialogBox;
}

/*
When mouse unclicked after highlighting, this creates the dialog box and adds it to the website.
*/
document.onmouseup = function(e) {
    if(e.target.closest(".lt-dialog-box")) return;
        
    const selectedElement = getSelectedEl();
    const selectedText = window.getSelection().toString().trim();

    if(selectedText){
        var dialogBox = makeDialogBox(e, selectedText, selectedElement);
        document.body.appendChild(dialogBox);

        dialogBox.querySelector("textarea").focus();
    }
};

/*
When mouse clicked outside of the dialog box.
*/
document.addEventListener("mousedown", function(e) {
    const allDialogBoxes = document.querySelectorAll(".lt-dialog-box");

    allDialogBoxes.forEach(box => {
        const input = box.querySelector(".lt-dialog-input");

        try {
            // Dialog box is deleted if comment is empty.
            if(!box.contains(e.target) && input.value.trim() === ""){

                if(box.sourceElement){
                    box.sourceElement.classList.remove("lt-selected-source");
                }
                box.remove();
            }
            else if (
                    !box.contains(e.target) && 
                    !(e.target.classList.contains("lt-selected-source") || e.target.closest(".lt-dialog-box")) &&
                    !document.getElementById("lt-HUD").classList.contains("hiding")
                )
            {   
                box.style.display = "none";  // Dialog boxes are hidden when clicked off.
            }
        }
        catch (TypeError) {
            box.style.display = "none";
        }
    });

    
    /* if(e.target.id !== "lt-HUD"){
        boxesVisible = !boxesVisible;
        document.getElementById("lt-HUD").classList.toggle("hiding", boxesVisible);
    } */
});


function HUDWindow(){
    const HUD_window = document.createElement("div");
    HUD_window.id = "lt-HUD-window";
    HUD_window.innerText = "Highlight a part of the website to add a comment.";

    return HUD_window;
}

let boxesVisible = false;
function makeHUD() {
    const HUD = document.createElement("div");
    HUD.id = "lt-HUD";
    HUD.innerText = "☰";

    HUD.addEventListener("click", (e) => {
        const allDialogBoxes = document.querySelectorAll(".lt-dialog-box");

        let display = "initial";

        boxesVisible = !boxesVisible;
        HUD.classList.toggle("hiding", boxesVisible);
        if(boxesVisible){
            display = "initial";
        }
        else {
            display = "none";
        }

        allDialogBoxes.forEach(box => {
            box.style.display = display;
        });
    });

    const HUD_window = HUDWindow();
    /* HUD.addEventListener("click", (e) => {
        const allDialogBoxes = document.querySelectorAll(".lt-dialog-box");

        allDialogBoxes.forEach(box => {
            const input = box.querySelector(".lt-dialog-input");

            let p = document.createElement("p");
            p.innerText = input.value.trim();
            
            HUD_window.appendChild(p);
        });
    }); */

    HUD.appendChild(HUD_window);  // MUST CHANGE!! CLICKING ON HUD_WINDOW HIDES HUD (because clicking on HUD). prob as own element in body, not HUD.
    document.body.appendChild(HUD);
}

/* 
Gets saved comments from database and loads into website.
*/
async function loadComments() {
    const res = await fetch(
        "http://localhost:3000/comments?page_url=" + encodeURIComponent(window.location.origin + window.location.pathname)
    );

    const comments = await res.json();

    comments.forEach(c => {
        const fEvent = {
            pageX: c.pos_x,
            pageY: c.pos_y
        };

        const element = document.querySelector(c.dom_path);
        const box = makeDialogBox(e=fEvent, dialogText=c.selected_text, sourceElement=element, userOwns=(c.author_id === authorID));
        box.dataset.commentID = c.id;
        box.querySelector("textarea").value = c.comment_text;

        document.body.appendChild(box);
    });
}


const authorID = getAuthorID();
loadComments();
makeHUD();