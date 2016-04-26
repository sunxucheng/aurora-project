package aurora.plugin.hec.export;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import org.apache.poi.ss.usermodel.Workbook;

import com.sun.xml.internal.messaging.saaj.packaging.mime.internet.MimeUtility;

import aurora.database.DBUtil;
import aurora.database.service.DatabaseServiceFactory;
import uncertain.core.UncertainEngine;

public class SqlExcelExportServlet extends HttpServlet {

	private static final long serialVersionUID = -979413117068433450L;

	protected void doService(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException, SQLException {
		Connection conn = null;
		PreparedStatement sqlStmt = null;
		PreparedStatement promptStmt = null;
		PreparedStatement paramStmt = null;
		PreparedStatement resultStmt = null;
		ResultSet sqlRs = null;
		ResultSet promptRs = null;
		ResultSet paramRs = null;
		ResultSet resultRs = null;
		List<String> paramList = null;
		String querySql="";
		try {
			String sqlCode = req.getParameter("sql_code");
			conn = getConnection(req);
			sqlStmt = conn
					.prepareStatement("select sql_text,export_file_name from hec_excel_exporter_config c where c.sql_code = ?");
			sqlStmt.setString(1, sqlCode);
			sqlRs = sqlStmt.executeQuery();
			sqlRs.next();
			querySql = sqlRs.getString(1);
			String exportFileName = sqlRs.getString(2)
					+ "_"
					+ new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
							.format(new Date()) + ".xlsx";
			promptStmt = conn
					.prepareStatement("select column_prompt from hec_excel_exporter_prompts p where p.sql_code = ? order by p.column_sequence");
			promptStmt.setString(1, sqlCode);
			promptRs = promptStmt.executeQuery();
			List<String> promptList = new ArrayList<String>();
			while (promptRs.next()) {
				String prompt = promptRs.getString(1);
				promptList.add(prompt);
			}
			paramStmt = conn
					.prepareStatement("select param_name from hec_excel_exporter_params p where p.sql_code = ? order by p.param_sequence");
			paramStmt.setString(1, sqlCode);
			paramRs = paramStmt.executeQuery();
			paramList = new ArrayList<String>();
			while (paramRs.next()) {
				paramList.add(paramRs.getString(1));
			}
			resultStmt = conn.prepareStatement(querySql);
			if (paramList != null) {
				for (int paramIndex = 0; paramIndex < paramList.size(); paramIndex++) {
					String paramValue = req.getParameter(paramList
							.get(paramIndex));
					resultStmt.setString(paramIndex + 1, paramValue);
				}
			}
			resultRs = resultStmt.executeQuery();
			int columnCount = resultStmt.getMetaData().getColumnCount();
			if (columnCount != promptList.size()) {
				String errorMsg = "excel导出器中设置的查询结果列数量与表头列数量不匹配，请联系管理员!";
				resp.setContentLength(errorMsg.getBytes().length);
				resp.setContentType("text/plain;charset=utf-8");
				resp.getWriter().append(errorMsg);
				resp.getWriter().close();
				return;
			} else {
				IExporter exporter = new SqlExcelExporter();
				Workbook wb = exporter.doExport(resultRs, promptList);
				resp.setContentType("application/vnd.ms-excel");
				resp.setHeader("Content-Disposition", "attachment;"
						+ processFileName(req, exportFileName));
				resp.setHeader("cache-control", "must-revalidate");
				resp.setHeader("pragma", "public");
				OutputStream ops = resp.getOutputStream();
				wb.write(ops);
				ops.close();
				exporter.dispose();
			}
		} catch (SQLException sex) {
			sex.printStackTrace();
			String errorMsg = sex.getMessage() + querySql;
			resp.setContentLength(errorMsg.getBytes().length);
			resp.setContentType("text/plain;charset=utf-8");
			resp.getWriter().append(errorMsg);
			resp.getWriter().close();
			return;
		} finally {
			DBUtil.closeResultSet(resultRs);
			DBUtil.closeResultSet(sqlRs);
			DBUtil.closeResultSet(paramRs);
			DBUtil.closeResultSet(promptRs);
			DBUtil.closeStatement(sqlStmt);
			DBUtil.closeStatement(promptStmt);
			DBUtil.closeStatement(paramStmt);
			DBUtil.closeStatement(resultStmt);
			DBUtil.closeConnection(conn);
		}

	}

	protected void doServiceWhereClause(HttpServletRequest req,
			HttpServletResponse resp) throws ServletException, IOException,
			SQLException {
		Connection conn = null;
		PreparedStatement sqlStmt = null;
		PreparedStatement promptStmt = null;
		PreparedStatement paramStmt = null;
		PreparedStatement resultStmt = null;
		ResultSet sqlRs = null;
		ResultSet promptRs = null;
		ResultSet paramRs = null;
		ResultSet resultRs = null;
		List<String[]> paramList = null;
		String selectClm = null;
		String whereClause = null;
		String querySql = null;
		try {
			String sqlCode = req.getParameter("sql_code");
			conn = getConnection(req);
			sqlStmt = conn
					.prepareStatement("select sql_text,export_file_name from hec_excel_exporter_config c where c.sql_code = ?");
			sqlStmt.setString(1, sqlCode);
			sqlRs = sqlStmt.executeQuery();
			sqlRs.next();
			querySql = sqlRs.getString(1);
			String exportFileName = sqlRs.getString(2)
					+ "_"
					+ new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
							.format(new Date()) + ".xlsx";
			promptStmt = conn
					.prepareStatement(
							"select column_prompt,column_name from hec_excel_exporter_prompts p where p.sql_code = ? order by p.column_sequence",
							ResultSet.TYPE_SCROLL_SENSITIVE,
							ResultSet.CONCUR_READ_ONLY);
			promptStmt.setString(1, sqlCode);
			promptRs = promptStmt.executeQuery();
			List<String> promptList = new ArrayList<String>();
			selectClm = "select ";
			while (promptRs.next()) {
				String prompt = promptRs.getString(1);
				if (promptRs.isLast()) {
					selectClm += promptRs.getString(2) + " from(";
				} else {
					selectClm += promptRs.getString(2) + ",";
				}
				promptList.add(prompt);
			}
			paramStmt = conn
					.prepareStatement("select param_name,query_op,query_exp from hec_excel_exporter_params p where p.sql_code = ? order by p.param_sequence");
			paramStmt.setString(1, sqlCode);
			paramRs = paramStmt.executeQuery();
			paramList = new ArrayList<String[]>();
			while (paramRs.next()) {
				String[] paraRs = { paramRs.getString(1), paramRs.getString(2),
						paramRs.getString(3) };
				paramList.add(paraRs);
			}
			if (paramList != null) {
				whereClause = ") where 1=1";
				for (int paramIndex = 0; paramIndex < paramList.size(); paramIndex++) {
					String paraName = paramList.get(paramIndex)[0];
					String paraOp = paramList.get(paramIndex)[1];
					String paraExp = paramList.get(paramIndex)[2];
					String paramValue = req.getParameter(paraName);
					if (paramValue != null && !paramValue.isEmpty()) {
						if (paraOp != null && !paraOp.isEmpty()) {
							if (paramIndex == paramList.size() - 1) {
								whereClause += " and " + paraName + " "
										+ paraOp + " '" + paramValue + "' ";
							} else {
								whereClause += " and " + paraName + " "
										+ paraOp + " '" + paramValue + "' ";
							}
						} else if (paraExp != null && !paraExp.isEmpty()) {
							if (paramIndex == paramList.size() - 1) {
								whereClause += " and "
										+ paraExp.replace("${@" + paraName
												+ "}", "'" + paramValue + "'");
							} else {
								whereClause += " and "
										+ paraExp.replace("${@" + paraName
												+ "}", "'" + paramValue + "'");
							}
						}
					}
				}
			}
			querySql = selectClm
					+ querySql.replace("#WHERE_CLAUSE#", whereClause);
			// System.out.println(querySql);
			resultStmt = conn.prepareStatement(querySql);
			resultRs = resultStmt.executeQuery();
			int columnCount = resultStmt.getMetaData().getColumnCount();
			if (columnCount != promptList.size()) {
				String errorMsg = "excel导出器中设置的查询结果列数量与表头列数量不匹配，请联系管理员!";
				resp.setContentLength(errorMsg.getBytes().length);
				resp.setContentType("text/plain;charset=utf-8");
				resp.getWriter().append(errorMsg);
				resp.getWriter().close();
				return;
			} else {
				IExporter exporter = new SqlExcelExporter();
				Workbook wb = exporter.doExport(resultRs, promptList);
				resp.setContentType("application/vnd.ms-excel");
				resp.setHeader("Content-Disposition", "attachment;"
						+ processFileName(req, exportFileName));
				// 基于查询的不能使用，查询的结果不是来自sql而是cache
				// resp.setHeader("cache-control", "must-revalidate");
				resp.setHeader("cache-control", "max-age=0");
				resp.setHeader("pragma", "public");
				OutputStream ops = resp.getOutputStream();
				wb.write(ops);
				ops.close();
				exporter.dispose();
			}
		} catch (SQLException sex) {
			sex.printStackTrace();
			String errorMsg = sex.getMessage() + querySql;
			resp.setContentLength(errorMsg.getBytes().length);
			resp.setContentType("text/plain;charset=utf-8");
			resp.getWriter().append(errorMsg);
			resp.getWriter().close();
			return;
		} finally {
			DBUtil.closeResultSet(resultRs);
			DBUtil.closeResultSet(sqlRs);
			DBUtil.closeResultSet(paramRs);
			DBUtil.closeResultSet(promptRs);
			DBUtil.closeStatement(sqlStmt);
			DBUtil.closeStatement(promptStmt);
			DBUtil.closeStatement(paramStmt);
			DBUtil.closeStatement(resultStmt);
			DBUtil.closeConnection(conn);
		}

	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		try {
			doService(req, resp);
			// 第二种方式
			// doServiceWhereClause(req, resp);
		} catch (SQLException sex) {

		}

	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		try {
			doService(req, resp);
		} catch (SQLException sex) {

		}
	}

	private Connection getConnection(HttpServletRequest req)
			throws SQLException {
		UncertainEngine engine = (UncertainEngine) req.getServletContext()
				.getAttribute(UncertainEngine.class.getName());
		DatabaseServiceFactory databaseFactory = (DatabaseServiceFactory) engine
				.getObjectRegistry().getInstanceOfType(
						DatabaseServiceFactory.class);
		DataSource ds = databaseFactory.getDataSource();
		Connection conn = ds.getConnection();
		return conn;
	}

	public String processFileName(HttpServletRequest request, String filename)
			throws UnsupportedEncodingException {
		String userAgent = request.getHeader("User-Agent");
		String new_filename = URLEncoder.encode(filename, "UTF8");
		// 如果没有UA，则默认使用IE的方式进行编码，因为毕竟IE还是占多数的
		String rtn = "filename=\"" + new_filename + "\"";
		if (userAgent != null) {
			userAgent = userAgent.toLowerCase();
			// IE浏览器，只能采用URLEncoder编码
			if (userAgent.indexOf("msie") != -1) {
				rtn = "filename=\""
						+ new String(filename.getBytes("gb2312"), "iso-8859-1")
						+ "\"";
			}
			// Opera浏览器只能采用filename*
			else if (userAgent.indexOf("opera") != -1) {
				rtn = "filename*=UTF-8''" + new_filename;
			}
			// Chrome浏览器，只能采用MimeUtility编码或ISO编码的中文输出
			else if (userAgent.indexOf("applewebkit") != -1) {
				new_filename = MimeUtility.encodeText(filename, "UTF8", "B");
				rtn = "filename=\"" + new_filename + "\"";
			}
			// Safari浏览器，只能采用ISO编码的中文输出
			else if (userAgent.indexOf("safari") != -1) {
				rtn = "filename=\""
						+ new String(filename.getBytes("UTF-8"), "ISO8859-1")
						+ "\"";
			}
			// FireFox浏览器，可以使用MimeUtility或filename*或ISO编码的中文输出
			else if (userAgent.indexOf("mozilla") != -1) {
				rtn = "filename*=UTF-8''" + new_filename;
			}
		}
		return rtn;
	}

}
