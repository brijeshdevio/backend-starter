import { Response } from "express";

type ApiResponse<D, E> = {
  success?: boolean;
  status: number;
  message?: string;
  data?: D;
  error?: E;
};

const defaultApiResponse = {
  success: true,
  status: 200,
  message: "Success",
};

export const apiResponse = <D, E>(
  res: Response,
  data: ApiResponse<D, E> = defaultApiResponse,
) => {
  data.status = data.status ?? 200;
  data.success = data.success ?? true;
  data.message = data.message ?? "Success";
  return res.status(data.status).json(data);
};
