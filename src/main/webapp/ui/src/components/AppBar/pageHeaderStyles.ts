import type { SxProps, Theme } from "@mui/material/styles";

/** Page chrome is shared by React pages and the shadow-root header on JSP pages. */
export const pageHeaderSx: SxProps<Theme> = {
  background: "#ffffff",
  color: "#203536",
  boxShadow: "0 1px 0 #dbe5e3",
  "&& > .MuiToolbar-root": {
    background: "#ffffff",
    color: "#203536",
    minHeight: 68,
    padding: "8px 24px !important",
    gap: 1,
    flexWrap: "wrap",
    "& .MuiSvgIcon-root": { color: "inherit" },
    "& .MuiIconButton-root": {
      width: 40,
      height: 40,
      borderRadius: "12px",
      color: "#486260",
      "&:hover": { background: "#edf4f1" },
    },
    "& nav .MuiLink-root[href]": {
      display: "inline-flex",
      alignItems: "center",
      minHeight: 42,
      padding: "8px 14px",
      marginTop: 0,
      borderRadius: "10px",
      color: "#486260 !important",
      fontSize: 14,
      fontWeight: 550,
      letterSpacing: 0,
      lineHeight: 1.5,
      textTransform: "none",
      whiteSpace: "nowrap",
      "&::after": { display: "none" },
      "&:hover": { background: "#f0f5f3" },
      '&[aria-current="page"]': {
        background: "#e1f0e9",
        color: "#125b50 !important",
        boxShadow: "inset 0 0 0 1px #c8e1d6",
        fontWeight: 650,
        lineHeight: 1.5,
        padding: "8px 14px",
        marginTop: 0,
        borderRadius: "10px",
      },
    },
    "& #app-menu-button": {
      minHeight: 44,
      borderRadius: "10px",
      background: "#edf4f1",
      borderColor: "#dbe5e3",
      color: "#203536",
    },
    "& :is(a, button, [tabindex]):focus-visible": {
      outline: "3px solid #187eae",
      outlineOffset: "3px",
    },
  },
  "@media (max-width: 700px)": {
    "&& > .MuiToolbar-root": { minHeight: 60, padding: "8px 12px !important", gap: 0.5 },
  },
  "@media (prefers-contrast: more)": {
    "&& > .MuiToolbar-root": {
      color: "#000",
      borderBottom: "2px solid #000",
      "& nav .MuiLink-root[href]": { color: "#000 !important" },
      '& nav .MuiLink-root[href][aria-current="page"]': { outline: "2px solid #000" },
    },
  },
};
