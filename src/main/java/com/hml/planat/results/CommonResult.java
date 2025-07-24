package com.hml.planat.results;

public enum CommonResult implements Result {
    FAILURE,
    FAILURE_ABSENT,
    FAILURE_DUPLICATE,
    FAILURE_NOT_FOUND,
    FAILURE_SELF,
    FAILURE_SESSION_EXPIRED,
    FAILURE_SIGNED,
    SUCCESS
}
