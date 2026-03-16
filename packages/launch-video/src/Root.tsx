import { Composition } from "remotion";
import { AiSyncLaunch } from "./AiSyncLaunch";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AiSyncLaunch"
        component={AiSyncLaunch}
        durationInFrames={1560}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
