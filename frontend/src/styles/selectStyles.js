const PRIMARY = {
    50: "#F3E6D5",
    100: "#E8D4BC",
    500: "#8B4513",
    600: "#6F370F",
    700: "#5B3418"
};

export const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: "48px",
        padding: "2px",
        borderRadius: "0.75rem",
        backgroundColor: "#FAF3E7",
        borderColor: state.isFocused ? PRIMARY[500] : "rgba(139, 69, 19, 0.2)",
        boxShadow: state.isFocused ? `0 0 0 1px ${PRIMARY[500]}` : "none",
        cursor: "pointer",
        "&:hover": {
            borderColor: PRIMARY[500]
        }
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? PRIMARY[500]
            : state.isFocused
              ? PRIMARY[50]
              : "transparent",
        color: state.isSelected ? "#FAF3E7" : PRIMARY[700],
        cursor: "pointer",
        "&:active": {
            backgroundColor: PRIMARY[600]
        }
    }),
    menu: (base) => ({
        ...base,
        borderRadius: "0.75rem",
        overflow: "hidden",
        backgroundColor: "#FAF3E7",
        border: "1px solid rgba(139, 69, 19, 0.12)",
        boxShadow: "0 4px 6px -1px rgba(91, 52, 24, 0.12), 0 2px 4px -1px rgba(91, 52, 24, 0.08)"
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999
    }),
    input: (base) => ({
        ...base,
        color: PRIMARY[700]
    }),
    singleValue: (base) => ({
        ...base,
        color: PRIMARY[700]
    }),
    placeholder: (base) => ({
        ...base,
        color: "#8B7B70"
    }),
    indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: "rgba(139, 69, 19, 0.15)"
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? PRIMARY[500] : "#8B7B70",
        "&:hover": {
            color: PRIMARY[500]
        }
    }),
    clearIndicator: (base) => ({
        ...base,
        color: "#8B7B70",
        "&:hover": {
            color: PRIMARY[500]
        }
    })
};
