namespace AppType {
    import { Types } from "mongoose";
    interface IAppMenu {
        _id: Types.ObjectId;
        name: string;
        icon: string;
        link: string;
        order: number;
        active: string;
    }
}