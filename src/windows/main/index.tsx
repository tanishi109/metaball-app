import * as React from "react";
import {render} from "react-dom";

import Canvas from "~/components/Canvas";
import {
  Root,
} from "./style";

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
      <Root>
        <Canvas />
      </Root>
    );
  }
}

import "~/styles/base";

render(<Main />, document.getElementById("root"));