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
        border-bottom: 4px solid #f5c542;
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
        z-index: ${topZIndex+1000};
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: #fff;
        border: 1.5px solid rgb(255, 255, 255);
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        font-size: 14px;
        font-weight: 500;
        color: black;
        transition: background 0.25s, color 0.25s, box-shadow 0.25s;
        user-select: none;
    }
    #lt-HUD.hiding {
        background: rgb(245, 66, 66);
        background: linear-gradient(90deg, rgb(245,66,66), rgb(255, 215, 137));
        color: #fff;
        box-shadow: 0 2px 12px rgba(245,66,66,0.3);
    }

    #lt-HUD-badge {
        font-size: 11px;
        padding: 1px 7px;
        border-radius: 20px;
        font-weight: 500;
        background: rgb(245, 66, 66);
        background: linear-gradient(90deg, rgb(245,66,66), rgb(255, 215, 137));
        color: #fff;
        transition: background 0.25s;
    }
    #lt-HUD.hiding #lt-HUD-badge {
        background: rgb(255, 255, 255);
        color: black;
    }

    #lt-HUD-window {
        position: fixed;
        bottom: 70px;
        right: 20px;
        width: 280px;
        max-height: 400px;
        display: none;
        flex-direction: column;
        background: #fff;
        border: 0.5px solid rgba(0,0,0,0.12);
        border-radius: 5px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        overflow: hidden;
        z-index: ${topZIndex+1000};
    }
    #lt-HUD.hiding #lt-HUD-window {
        display: flex;
    }

    #lt-HUD-window-header {
        padding: 12px 16px;
        border-bottom: 0.5px solid rgba(0,0,0,0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
    }
    #lt-HUD-window-list {
        overflow-y: auto;
        flex: 1;
    }
    .lt-HUD-item {
        padding: 10px 16px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        border-bottom: 0.5px solid rgba(0,0,0,0.06);
        cursor: pointer;
    }
    .lt-HUD-item:last-child { border-bottom: none; }
    .lt-HUD-item:hover { background: rgba(0,0,0,0.03); }
    .lt-HUD-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-top: 4px;
        flex-shrink: 0;
    }
    .lt-HUD-item-selected {
        font-size: 12px;
        color: gray;
        font-style: italic;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0 0 2px;
    }
    .lt-HUD-item-comment {
        font-size: 13px;
        margin: 0;
        color: black;
    }
    #lt-HUD-window-footer {
        padding: 8px 16px;
        border-top: 0.5px solid rgba(0,0,0,0.08);
        font-size: 12px;
        color: gray;
        text-align: center;
        flex-shrink: 0;
    }
    `

    document.head.appendChild(style);
})();



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
function makeDialogBox(e, dialogText, sourceElement, userOwns=true, dialogComment=null){
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
    });

    /*
    Dialog box styling.
    */
    Object.assign(dialogBox.style, {
        left: e.pageX + "px",
        top: (e.pageY + 10) + "px",
        zIndex: String(topZIndex + 1)
    });

    // --- DRAG LOGIC ---
    let isDragging = false;
    let offsetX, offsetY;
    /*
    Start dragging logic
    */
    dialogBox.addEventListener("mousedown", (e) => {
        bringToFront(dialogBox);
        if(userOwns){
            submitBtn.style.display = "initial";
        }
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
    label.innerHTML = `<strong>Selected: </strong>"<span style="color:red;">${labelText}</span>"`;
    
    /*
    Form (Input field and submit button) for comments.
    */
    const form = document.createElement("form");
    form.className = "lt-dialog-form";

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

            refreshHUD();
        }
        else {
            if(comment === ""){  // existing comment made empty, deleting comment box.
                await fetch(`http://localhost:3000/comments/${commentID}`, { method: "DELETE" });
                refreshHUD();
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
                refreshHUD();
            }
        }

        // Hides and disables submit and close buttons when comment inputted.
        submitBtn.disabled = true;
        submitBtn.style.display = "none";

        closeBtn.disabled = true;
        closeBtn.style.display = "none";
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

        dialogBox.remove();

        const hasComments = Array.from(document.querySelectorAll(".lt-dialog-box"))
            .some(box => box.sourceElement === sourceElement);

        if(!hasComments){
            sourceElement.classList.remove("lt-selected-source");
        }
        refreshHUD();
    });

    // If an existing comment, input field is loaded with comment. 
    if(dialogComment){
        inputField.value = dialogComment;
        submitBtn.style.display = "none";
        closeBtn.style.display = "none";
    }
    // If the comment is from someone other than the user, its styled accordingly and its input field is uneditable.
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

    if(selectedText/*  && !selectedElement.classList.contains("lt-selected-source") */){
        var dialogBox = makeDialogBox(e, selectedText, selectedElement);
        document.body.appendChild(dialogBox);

        dialogBox.querySelector("textarea").focus();
    }
};

/*
When mouse clicked outside of a dialog box.
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
                    !document.getElementById("lt-HUD").classList.contains("hiding")
                )
            {   
                try{
                    box.querySelector('.lt-submit-button').style.display = "none";
                }catch (err){};
                box.querySelector('.lt-close-button').style.display = "none";
                
                if( !(e.target.classList.contains("lt-selected-source") || e.target.closest(".lt-dialog-box")) ) box.style.display = "none";  // Dialog boxes (and buttons) are hidden when clicked off.
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
        const ownership = c.author_id === authorID;
        const box = makeDialogBox(e=fEvent, dialogText=c.selected_text, sourceElement=element, userOwns=ownership, dialogComment=c.comment_text);
        box.dataset.commentID = c.id;

        document.body.appendChild(box);
    });

    refreshHUD();
}

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

    // Dot icon
    /* const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("width", "14"); icon.setAttribute("height", "14");
    icon.setAttribute("viewBox", "0 0 16 16");
    icon.innerHTML = `<circle cx="8" cy="4" r="1.5" fill="currentColor"/>
                      <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                      <circle cx="8" cy="12" r="1.5" fill="currentColor"/>`; */

    const label = document.createElement("span");
    label.textContent = "LightTrail";

    const badge = document.createElement("span");
    badge.id = "lt-HUD-badge";
    badge.textContent = "0";

    // Panel
    const panel = document.createElement("div");
    panel.id = "lt-HUD-window";

    const header = document.createElement("div");
    header.id = "lt-HUD-window-header";
    /* header.innerHTML = `<span style="font-size:14px;font-weight:500;">Comments</span>
                        <span style="font-size:12px;color:gray;">this page</span>`; */

    const list = document.createElement("div");
    list.id = "lt-HUD-window-list";

    const footer = document.createElement("div");
    footer.id = "lt-HUD-window-footer";
    footer.textContent = "highlight text to add a comment";

    panel.appendChild(header);
    panel.appendChild(list);
    panel.appendChild(footer);

    // HUD.appendChild(icon);
    HUD.appendChild(label);
    HUD.appendChild(badge);
    HUD.appendChild(panel);

    HUD.addEventListener("click", (e) => {
        e.stopPropagation();
        boxesVisible = !boxesVisible;
        HUD.classList.toggle("hiding", boxesVisible);

        const display = boxesVisible ? "initial" : "none";
        document.querySelectorAll(".lt-dialog-box").forEach(box => {
            box.style.display = display;
        });

        if (boxesVisible) refreshHUD();
    });

    document.body.appendChild(HUD);
}

function refreshHUD() {
    const list = document.getElementById("lt-HUD-window-list");
    const badge = document.getElementById("lt-HUD-badge");
    if (!list) return;

    const boxes = Array.from(document.querySelectorAll(".lt-dialog-box"));
    const saved = boxes.filter(b => b.dataset.commentID);

    badge.textContent = saved.length;
    list.innerHTML = "";

    if (saved.length === 0) {
        list.innerHTML = `<p style="font-size:13px;color:gray;text-align:center;padding:16px;margin:0;">no comments yet</p>`;
        return;
    }

    saved.forEach(box => {
        const isOwn = !box.classList.contains("lt-other-user");
        const selectedText = box.querySelector(".lt-label span")?.textContent || "";
        const commentText  = box.querySelector("textarea")?.value || "";

        const item = document.createElement("div");
        item.className = "lt-HUD-item";
        item.innerHTML = `
            <div class="lt-HUD-dot" style="background:${isOwn ? "rgb(245,66,66)" : "rgb(245,197,66)"}"></div>
            <div style="flex:1;min-width:0;">
                <p class="lt-HUD-item-selected">"${selectedText}"</p>
                <p class="lt-HUD-item-comment">${commentText}</p>
            </div>`;

        // Clicking a HUD item scrolls to and reveals its dialog box
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            box.style.display = "initial";
            box.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        list.appendChild(item);
    });
}


/*
WebSocket connection to server. All changes (adding, deleting, posting commeents) are shared, allowing for realtime updates.
*/
const ws = new WebSocket(`ws://localhost:3000`);
ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if(data.type === 'comment_created'){
        if(data.comment.page_url === window.location.origin + window.location.pathname && data.comment.author_id !== localStorage.getItem("lt-author-id")){
            const fEvent = { pageX: data.comment.pos_x, pageY: data.comment.pos_y };
            const element = document.querySelector(data.comment.dom_path);
            const box = makeDialogBox(e=fEvent, dialogText=data.comment.selected_text, sourceElement=element, userOwns=false, dialogComment=data.comment.comment_text);

            box.dataset.commentID = data.comment.id;
            document.body.appendChild(box);
        }
    }

    if(data.type === 'comment_deleted'){
        document.querySelectorAll('.lt-dialog-box').forEach(box => {
            if(box.dataset.commentID == data.comment.id){
                const sourceElement = document.querySelector(data.comment.dom_path);
                box.remove();

                const hasComments = Array.from(document.querySelectorAll(".lt-dialog-box"))
                    .some(b => b.sourceElement === sourceElement);

                if(!hasComments){
                    sourceElement.classList.remove("lt-selected-source");
                }
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

    if(data.type === 'comment_created' || data.type === 'comment_deleted' || data.type === 'comment_updated'){
        refreshHUD();
    }
});
const authorID = getAuthorID();
loadComments();
makeHUD();
