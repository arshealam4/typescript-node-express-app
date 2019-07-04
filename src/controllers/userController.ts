import * as config from "config";
import UsersModel1 from "../lib/maindb";
const UsersModel =  UsersModel1.model("Users");
import * as sha5 from "js-sha512";
const sha512 =  sha5.sha512;
import * as polyfill from "babel-polyfill";
import * as jwt from "jsonwebtoken";
import responseHandler from "../lib/responseHandler";

class userController {
    constructor() { }

    public signup = async (req, res, next) => {

        const userName = req.body.userName;
        const email = req.body.email;
        const password = req.body.password;
        const gender = req.body.gender;

        if (!userName || !email || !password) {
            return responseHandler.makeResponse(res, false, 400, "invalid input parameters!", []);
        }
        try {
            const user = await UsersModel.findOne({ email });
            if (user) {
                return responseHandler.makeResponse(res, false, 200, "user already exist!", []);
            }
            const userObj =  new UsersModel({
                userName,
                email,
                password: sha512(password),
                gender,
            });
            await userObj.save();
            return responseHandler.makeResponse(res, true, 201, "user successfully registered!", []);
        } catch (err) {
            return responseHandler.makeResponse(res, false, 500, "internel server error!", []);
        }
    }

    public login = async (req, res, next) => {

        const email = req.body.email.toLowerCase();
        let password = req.body.password;
        const role = req.body.role ? req.body.role : "user";

        if (!email || !password) {
            return responseHandler.makeResponse(res, false, 400, "invalid input parameters", []);
        }

        try {
            password = sha512(password);

            const user: any = await UsersModel.findOne({ email, password, active: true, role });

            if (!user) {

                const user: any = await UsersModel.findOne({ email, password });

                if (!user) {
                    return responseHandler.makeResponse(res, false, 400, "username or password is incorrect!", []);
                } else if (!user.active) {
                    return responseHandler.makeResponse(res, false, 400, "user not activated, Please check your email to activate account!", []);
                } else {
                    return responseHandler.makeResponse(res, false, 400, "thers is some issue, please try again!", []);
                }
            } else {
                const token = jwt.sign({
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                }, config.get("secret"), {
                        expiresIn: config.get("jwt_expiretime"),
                    });

                return responseHandler.makeResponse(res, true, 200, "login success", [{token, email: user.email}]);

            }

        } catch (err) {
            return responseHandler.makeResponse(res, false, 500, "internel server error", []);
        }
    }

    public getUserList = async (req, res, next) => {
        console.log("req.params", req.params);

        const pageNo = parseInt(req.params.pageNo);
        const limit = parseInt(req.params.limit);
        const skip = limit * (pageNo - 1);

        if (limit && pageNo) {
            const user = await UsersModel.find({}, "-password").skip(skip).limit(limit);
            return responseHandler.makeResponse(res, true, 200, "success", user);
        } else {
            try {
                const user = await UsersModel.find({}, "-password");
                return responseHandler.makeResponse(res, true, 200, "success", user);
            } catch (err) {
                console.log(err);
                return responseHandler.makeResponse(res, false, 500, "failed", []);
            }
        }

    }
}

export default new userController();
