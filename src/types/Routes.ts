import { ParamListBase } from "@react-navigation/native";

export type RootStackParamList = ParamListBase & {
    Dashboard: undefined;
    Login: undefined;
    Cuenta: undefined;
    Messages: undefined;
    RoadmapDetails: { id: string };
    Roadmap: undefined;
    NotFound: undefined;
    AddMessage: { id?: string };
    RoadmapDetailsEditCreateOrderReturnDetail: { id?: string };
    RoadmapDetailsEditCreateOrderDetail: { id?: string };
}