"""
Agent tools for interacting with Splunk via MCP.
"""
from app.services.splunk_mcp_client import splunk_client


async def search_splunk_logs(query: str, time_range: str = "-24h") -> dict:
    """Search Splunk logs using SPL query."""
    result = await splunk_client.run_query(query, earliest=time_range)
    return {
        "tool": "search_splunk_logs",
        "query": query,
        "time_range": time_range,
        "results": result["results"],
        "result_count": result["result_count"],
        "execution_time_ms": result["execution_time_ms"],
    }


async def get_error_patterns(service: str, time_range: str = "-1h") -> dict:
    """Get error patterns for a specific service from Splunk."""
    query = f'index=main sourcetype=app_logs host={service} level=ERROR | stats count by error_type | sort -count'
    return await search_splunk_logs(query, time_range)


async def get_security_events(src_ip: str = None, time_range: str = "-24h") -> dict:
    """Get security events, optionally filtered by source IP."""
    query = 'index=security sourcetype=auth_logs action=failure | stats count by src_ip | sort -count'
    if src_ip:
        query = f'index=security sourcetype=auth_logs src_ip={src_ip} | stats count by action, user'
    return await search_splunk_logs(query, time_range)


async def get_infrastructure_metrics(host: str = None, metric: str = "cpu.percent") -> dict:
    """Get infrastructure metrics from Splunk."""
    query = f'index=infra sourcetype=metrics metric_name={metric}'
    if host:
        query += f' host={host}'
    query += ' | stats avg(value) as avg_value, max(value) as max_value by host'
    return await search_splunk_logs(query)
