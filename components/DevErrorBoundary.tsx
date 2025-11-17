import React from "react";

type State = { hasError: boolean; error?: any };

export default class DevErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("Render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <pre style={{ whiteSpace: "pre-wrap", padding: 16, color: "#fca5a5" }}>
          💥 Render error in child component:
          {"\n"}{String(this.state.error)}
        </pre>
      );
    }
    return this.props.children;
  }
}

