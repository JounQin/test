import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

export const Loading = () => {
  return (
    <div className="fx-center" style={{ height: "100%" }}>
      <Spin indicator={<LoadingOutlined />} />
      <span className="ml-8">{"loading"}</span>
    </div>
  );
};
