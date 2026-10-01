import ipaddress
import socket
from urllib.parse import urlparse
from typing import Tuple

# Blacklisted local / private IP ranges to prevent SSRF
BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("100.64.0.0/10"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.0.0.0/24"),
    ipaddress.ip_network("192.0.2.0/24"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("198.18.0.0/15"),
    ipaddress.ip_network("198.51.100.0/24"),
    ipaddress.ip_network("203.0.113.0/24"),
    ipaddress.ip_network("224.0.0.0/4"),
    ipaddress.ip_network("240.0.0.0/4"),
    ipaddress.ip_network("::/128"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]

def is_safe_url(url: str) -> Tuple[bool, str]:
    """
    Validates that a URL is a legitimate public web address
    and protects against Server-Side Request Forgery (SSRF).
    """
    if not url or not isinstance(url, str):
        return False, "URL is empty or not a string."
        
    url = url.strip()
    parsed = urlparse(url)
    
    if parsed.scheme not in ("http", "https"):
        return False, "Only HTTP and HTTPS URLs are supported."
        
    hostname = parsed.hostname
    if not hostname:
        return False, "URL does not contain a valid hostname."
        
    # Prevent localhost explicitly
    if hostname.lower() in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
        return False, "Access to localhost or internal network addresses is prohibited."
        
    try:
        # Resolve hostname to IP to verify it is not in a private/internal range
        addr_info = socket.getaddrinfo(hostname, None)
        for item in addr_info:
            ip_str = item[4][0]
            ip_obj = ipaddress.ip_address(ip_str)
            for net in BLOCKED_IP_NETWORKS:
                if ip_obj in net:
                    return False, "The target server IP resolves to a restricted internal network address."
    except Exception:
        # If DNS resolution fails, reject safely
        return False, f"Could not resolve domain name '{hostname}'. Please check the URL."
        
    return True, "URL is safe and valid."
