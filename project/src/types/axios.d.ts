declare module 'axios' {
  export interface AxiosRequestConfig {
    // URL for the request
    url?: string;
    // Base URL will be prepended to `url` unless `url` is absolute
    baseURL?: string;
    // Request method (default: 'get')
    method?: 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH' | 'link' | 'LINK' | 'unlink' | 'UNLINK';
    // Request headers
    headers?: Record<string, string>;
    // URL parameters to be sent with the request
    params?: any;
    // Data to be sent as the request body
    data?: any;
    // Timeout in milliseconds
    timeout?: number;
    // Indicates whether or not cross-site Access-Control requests should be made using credentials
    withCredentials?: boolean;
    // Indicates the type of data that the server will respond with
    responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
    // Custom transform for request/response data
    transformRequest?: ((data: any, headers?: any) => any) | Array<(data: any, headers?: any) => any>;
    transformResponse?: ((data: any) => any) | Array<(data: any) => any>;
    // Indicates that HTTP Basic auth should be used, and supplies credentials
    auth?: {
      username: string;
      password: string;
    };
    // Custom request transformer
    adapter?: (config: AxiosRequestConfig) => Promise<any>;
    // Custom instance config
    xsrfCookieName?: string;
    xsrfHeaderName?: string;
    // Progress event handler
    onUploadProgress?: (progressEvent: any) => void;
    onDownloadProgress?: (progressEvent: any) => void;
    // Maximum content length allowed for the request
    maxContentLength?: number;
    // Validate status function
    validateStatus?: (status: number) => boolean;
    // Maximum redirects to follow
    maxRedirects?: number;
    // Custom HTTP agent
    httpAgent?: any;
    httpsAgent?: any;
    // Proxy settings
    proxy?: {
      host: string;
      port: number;
      auth?: {
        username: string;
        password: string;
      };
      protocol?: string;
    } | false;
    // Cancel token
    cancelToken?: any;
  }

  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: AxiosRequestConfig;
    request?: any;
  }

  export interface AxiosError<T = any> extends Error {
    config: AxiosRequestConfig;
    code?: string;
    request?: any;
    response?: AxiosResponse<T>;
    isAxiosError: boolean;
    toJSON: () => object;
  }

  export interface AxiosInterceptorManager<V> {
    use(
      onFulfilled?: (value: V) => V | Promise<V>,
      onRejected?: (error: any) => any
    ): number;
    eject(id: number): void;
  }


  export interface AxiosInstance {
    defaults: AxiosRequestConfig;
    interceptors: {
      request: AxiosInterceptorManager<AxiosRequestConfig>;
      response: AxiosInterceptorManager<AxiosResponse>;
    };
    
    request<T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R>;
    get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
    delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
    head<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
    options<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
    
    post<T = any, R = AxiosResponse<T>>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<R>;
    
    put<T = any, R = AxiosResponse<T>>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<R>;
    
    patch<T = any, R = AxiosResponse<T>>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<R>;
    
    getUri(config?: AxiosRequestConfig): string;
  }

  export interface AxiosStatic extends AxiosInstance {
    create(config?: AxiosRequestConfig): AxiosInstance;
    isAxiosError(payload: any): payload is AxiosError;
    isCancel(value: any): boolean;
    all<T>(values: Array<T | Promise<T>>): Promise<T[]>;
    spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R;
    Cancel: any;
    CancelToken: any;
  }

  const axios: AxiosStatic;
  export default axios;
}
