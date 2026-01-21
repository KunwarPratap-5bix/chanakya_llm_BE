declare module '@simonsmith/ejs-mate' {
    import { RequestHandler } from 'express';

    interface EjsMateOptions {}

    function ejsMate(viewPath: string, options?: EjsMateOptions): RequestHandler;

    export default ejsMate;
}
