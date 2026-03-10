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
        z-index: 9999;
        overflow: hidden;

        user-select: none;
    }

    .lt-label {
        color: black;
        margin-bottom: 8px;
        font-size: 16px;
        font-style: italic;
        text-align: left
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

    .lt-dialog-input {
        width: 100%;
        box-sizing: border-box;
        border-radius: 4px;
        field-sizing: content;
        padding: 4px;
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

    #lt-HUD {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
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
    `

    document.head.appendChild(style);
})();

/*
Creates popup dialog box for comments.
*/
function makeDialogBox(e, dialogText, sourceElement){
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
    });

    // --- DRAG LOGIC ---
    let isDragging = false;
    let offsetX, offsetY;

    /*
    Start dragging logic
    */
    dialogBox.addEventListener("mousedown", (e) => {
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
    Close popup button.
    */
    const closeBtn = document.createElement("span");
    closeBtn.innerText = "❌";
    closeBtn.className = "lt-close-button";
    closeBtn.addEventListener("click", () => {
        sourceElement.classList.remove("lt-selected-source");
        dialogBox.remove();
    });

    /*
    Displays what was specifically selected by user.
    */
    const label = document.createElement("div");
    console.log(e.target.tagName.toLowerCase());

    const numChars = 20;
    const labelText = dialogText.length > numChars ? dialogText.substring(0,numChars) + "..." : dialogText;
    label.className = "lt-label";
    label.innerHTML = `<strong>Selected: </strong>"<span style="color:red;">${labelText}</span>"`;
    
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
    submitBtn.innerText = "Add";
    submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
    });

    form.appendChild(inputField);
    form.appendChild(submitBtn);
    form.appendChild(closeBtn);

    // dialogBox.appendChild(closeBtn);
    dialogBox.appendChild(label);
    dialogBox.appendChild(form);

    return dialogBox;
}

/*
When mouse unclicked after highlighting, this creates the dialog box and adds it to the website.
*/
document.onmouseup = function(e) {
    if(e.target.closest(".lt-dialog-box")) return;
    
    const selectedText = window.getSelection().toString().trim();

    console.log(getSelectedEl());

    if(selectedText){
        var dialogBox = makeDialogBox(e, selectedText, e.target);
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

        // Dialog box is deleted if comment is empty.
        if(!box.contains(e.target) && input.value.trim() === ""){

            if(box.sourceElement){ 
                box.sourceElement.style.backgroundColor = "";
                box.sourceElement.classList.remove("lt-selected-source");
            }
            box.remove();
        }
        else if(!box.contains(e.target) && !document.getElementById("lt-HUD").classList.contains("hiding")){   
            box.style.display = "none";     // Dialog boxes are hidden when clicked off.
        }
    });

    
    /* if(e.target.id !== "lt-HUD"){
        boxesVisible = !boxesVisible;
        document.getElementById("lt-HUD").classList.toggle("hiding", boxesVisible);
    } */
});


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

    document.body.appendChild(HUD);
}

makeHUD();