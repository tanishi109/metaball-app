import * as React from "react";
import {render} from "react-dom";

interface Props {
}
interface State {
}

class Main extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

  }

  render(): JSX.Element {
    return (
      <div>
        <h1>sample app</h1>
      </div>
    );
  }
}

render(<Main />, document.getElementById("root"));