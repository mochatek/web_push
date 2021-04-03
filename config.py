from os import environ

class Config:
    VAPID_PRIVATE_KEY  = environ.get('PRIVATE_KEY') or 'w4ZgnUxMoZUIS0cSkejDdsmfowXxuS0t2Iexu8bTi7I'
    VAPID_PUBLIC_KEY   = environ.get('PUBLIC_KEY') or 'BP2oxGA7fKjIH6Z1MjPQW1HD4A4hfZ5Jp5q-ou3tDxdpmcgmzncx7BJq2au5VU4BHaz36Cpm9K37diZyI0zMbmo'