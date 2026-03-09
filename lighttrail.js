/* function getSelectedText(){
    var text = "";
    if(typeof window.getSelection != "undefined"){
        text = window.getSelection().toString();
    }
    return text;
} */


/*
Creates popup dialog box for comments.
*/
function makeDialogBox(e, dialogText, sourceElement){
    var dialogBox = document.createElement("div");
    dialogBox.className = "dialogBox";

    /*
    Marks selected element's source element.
    Highlights source elements red and adds event listener to display
    connected dialog box.
    */
    dialogBox.sourceElement = sourceElement;
    sourceElement.classList.add("selected-source");
    Object.assign(sourceElement.style, {
        backgroundColor: "rgba(245, 66, 66, 0.3)",
    })
    // Clicking the source element will unhide its dialog box.
    sourceElement.addEventListener("click", () => {
        dialogBox.style.display = "initial";
    });

    /*
    Dialog box styling.
    */
    Object.assign(dialogBox.style, {
        position: "absolute",
        left: e.pageX + "px",
        top: (e.pageY + 10) + "px",
        width: "300px",
        padding: "10px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderBottom: "2px solid rgb(255, 66, 66)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: "5px",
        zIndex: "9999",
        overflow: "hidden"
    });

    // --- DRAG LOGIC ---
    let isDragging = false;
    let offsetX, offsetY;

    /*
    Start dragging logic
    */
    dialogBox.addEventListener("mousedown", (e) => {
        if(e.target.tagName === "TEXTAREA" || e.target.tagName === "SPAN") return;  // so these elements can still function. 

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
    Object.assign(closeBtn.style, {
        color: "red",
        float: "right",
        cursor: "pointer",
        fontWeight: "bold"
    });
    closeBtn.addEventListener("mouseover", () => {
        closeBtn.style.backgroundColor = "gray"
    });
    closeBtn.addEventListener("mouseout", () => {
        closeBtn.style.backgroundColor = ""
    });    
    closeBtn.addEventListener("click", () => {
        sourceElement.classList.remove("selected-source");
        sourceElement.style.backgroundColor = "";
        dialogBox.remove();
    });

    /*
    Displays what was specifically selected by user.
    */
    const label = document.createElement("div");
    console.log(e.target.tagName.toLowerCase());
    if(dialogText.length > 15) (dialogText = dialogText.substring(0,15) + "...");
    Object.assign(label.style, {
        color: "black",
        marginBottom: "8px",
        fontSize: "16px",
        fontStyle: "italic",
        textAlign: "left"
    });
    label.innerHTML = `<strong>Selected: </strong><span style="color:red;">"${dialogText}"</span>`;
    
    /*
    Form (Input field and submit button) for comments.
    */
    const form = document.createElement("form");

    const inputField = document.createElement("textarea");
    inputField.className = "dialogInput";
    inputField.placeholder = "Type here...";
    inputField.name = "comment";
    Object.assign(inputField.style, {
        width: "100%",
        boxSizing: "border-box",
        borderRadius: "4px",
        fieldSizing: "content",
        padding: '4px'
    });
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";

    form.appendChild(inputField);
    form.appendChild(submitBtn);
    
    dialogBox.appendChild(closeBtn);
    dialogBox.appendChild(label);
    dialogBox.appendChild(inputField);
    dialogBox.appendChild(form);

    return dialogBox;
}

/*
When mouse unclicked after highlighting, this creates the dialog box and adds it to the website.
*/
document.onmouseup = function(e) {
    if(e.target.closest(".dialogBox")) return;
    
    const selectedText = window.getSelection().toString().trim();

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
    const allDialogBoxes = document.querySelectorAll(".dialogBox");

    allDialogBoxes.forEach(box => {
        const input = box.querySelector(".dialogInput");

        // Dialog box is deleted if comment is empty.
        if(!box.contains(e.target) && input.value.trim() === ""){

            if(box.sourceElement){ 
                box.sourceElement.style.backgroundColor = "";
                box.sourceElement.classList.remove("selected-source");
            }
            box.remove();
        }
        else if(!box.contains(e.target)){   
            box.style.display = "none";     // Dialog boxes are hidden when clicked off.
        }
    });
});

