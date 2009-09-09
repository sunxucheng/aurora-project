/*
 * Created on 2009-9-2 下午08:17:54
 * Author: Zhou Fan
 */
package aurora.service.http;

import java.io.IOException;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.xml.sax.SAXException;

import uncertain.composite.CompositeLoader;
import uncertain.composite.CompositeMap;
import uncertain.core.UncertainEngine;
import aurora.application.features.HttpRequestTransfer;
import aurora.service.controller.ControllerProcedures;

public class HttpServiceFactory {
    
    public static final String KEY_PROCEDURE_MAPPING = "procedure-mapping";

    public static final String KEY_PROCEDURE = "procedure";

    public static final String KEY_EXTENSION = "extension";

    static String BUILTIN_PROCEDURE_PACKAGE = ControllerProcedures.class.getPackage().getName();
    
    static Map  BUILTIN_MAPPING = new CompositeMap(KEY_PROCEDURE_MAPPING);
    static
    {
        BUILTIN_MAPPING.put("screen", ControllerProcedures.RUN_SCREEN);
        BUILTIN_MAPPING.put("svc", ControllerProcedures.INVOKE_SERVICE);
    }
    
    Map     mProcedureMapping = BUILTIN_MAPPING;
    
    /**
     * @param uncertainEngine
     */
    public HttpServiceFactory(UncertainEngine uncertainEngine) {
        super();
        mUncertainEngine = uncertainEngine;
        mCompositeLoader = new CompositeLoader();
        mCompositeLoader.ignoreAttributeCase();
        //mCompositeLoader.setCacheEnabled(true);
    }

    UncertainEngine     mUncertainEngine;
    CompositeLoader      mCompositeLoader;
    
    public CompositeLoader getCompositeLoader(){
        return mCompositeLoader;
    }
    
    public CompositeMap loadServiceConfig( String name )
        throws IOException, SAXException
    {
        CompositeMap service_config = mCompositeLoader.loadByFile(name);
        return service_config;
    }
    
    public HttpServiceInstance createHttpService( String name, HttpServletRequest request, HttpServletResponse response, HttpServlet servlet )
    {
        HttpServiceInstance svc = new HttpServiceInstance( name, mUncertainEngine.getProcedureManager() );
        svc.setRequest(request);
        svc.setResponse(response);
        svc.setServlet(servlet);   
        HttpRequestTransfer.copyRequest(svc);
        return svc;
    }
    
    public void addProcedureMapping( CompositeMap config ){
        mProcedureMapping = new CompositeMap(KEY_PROCEDURE_MAPPING);
        Iterator it = config.getChildIterator();
        while(it.hasNext()){
            CompositeMap item = (CompositeMap)it.next();
            String extension = item.getString(KEY_EXTENSION);
            String procedure = item.getString(KEY_PROCEDURE);
            mProcedureMapping.put(extension, procedure);
        }
        
    }
    
    public String getProcedureName( String type ){
        return (String)mProcedureMapping.get(type);
    }

}
