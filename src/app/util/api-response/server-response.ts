/**
 * Represents the structure of a typical server response with a generic data payload.
 *
 * @template T - The type of the data payload included in the response.
 * @property {string} message - A message describing the response or providing additional context.
 * @property {number} statusCode - The HTTP status code associated with the server response.
 * @property {string} timestamp - The timestamp indicating when the response was generated.
 * @property {T} [data] - An optional payload containing the actual data returned by the server.
 */
export interface ServerResponse<T>{
  message: string;
  statusCode: number;
  timestamp: string;
  data?: T;
}
