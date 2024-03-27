export const unselectableStyle = {
    MozUserSelect: "-moz-none",
    KhtmlUserSelect: "none",
    WebkitUserSelect: "none",
    OUserSelect: "none",
    UserSelect: "none"
}

export const clueBoxStyle = Object.assign({}, {
    border: "3px solid #FFEAA8",
    color: "#444",
    padding: "1%",
    marginBottom: "10px",
    backgroundColor: "#FFEAA8",
    cursor: "default"
  }, unselectableStyle)