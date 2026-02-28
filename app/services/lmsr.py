"""LMSR (Logarithmic Market Scoring Rule) pricing engine.

Pure math module — no database, no I/O.
Uses log-sum-exp trick for numerical stability.
"""

import math
from decimal import Decimal, ROUND_HALF_UP

PRECISION = Decimal("0.00000001")  # 8 decimal places


def _to_float(d: Decimal) -> float:
    return float(d)


def _to_decimal(f: float) -> Decimal:
    return Decimal(str(f)).quantize(PRECISION, rounding=ROUND_HALF_UP)


def cost(q_yes: Decimal, q_no: Decimal, b: Decimal) -> Decimal:
    """Cost function: C(q) = b * ln(exp(q_yes/b) + exp(q_no/b))

    Uses log-sum-exp trick: b * (max_q/b + ln(exp((q_yes - max_q)/b) + exp((q_no - max_q)/b)))
    """
    qy, qn, bb = _to_float(q_yes), _to_float(q_no), _to_float(b)
    max_q = max(qy, qn)
    result = bb * (max_q / bb + math.log(math.exp((qy - max_q) / bb) + math.exp((qn - max_q) / bb)))
    return _to_decimal(result)


def price_yes(q_yes: Decimal, q_no: Decimal, b: Decimal) -> Decimal:
    """Current YES price: exp(q_yes/b) / (exp(q_yes/b) + exp(q_no/b))

    Simplified with log-sum-exp: 1 / (1 + exp((q_no - q_yes) / b))
    """
    qy, qn, bb = _to_float(q_yes), _to_float(q_no), _to_float(b)
    diff = (qn - qy) / bb
    if diff > 500:
        return _to_decimal(0.0)
    if diff < -500:
        return _to_decimal(1.0)
    return _to_decimal(1.0 / (1.0 + math.exp(diff)))


def price_no(q_yes: Decimal, q_no: Decimal, b: Decimal) -> Decimal:
    """Current NO price: 1 - price_yes. Always sums to 1."""
    return Decimal("1") - price_yes(q_yes, q_no, b)


def shares_for_buy(
    q_yes: Decimal, q_no: Decimal, b: Decimal, side: str, amount: Decimal
) -> Decimal:
    """How many shares does the user receive for spending `amount`?

    For buying YES shares:
        new_q_yes satisfies: cost(new_q_yes, q_no, b) - cost(q_yes, q_no, b) = amount
        new_q_yes = b * ln(exp(amount/b) * (exp(q_yes/b) + exp(q_no/b)) - exp(q_no/b))
        shares = new_q_yes - q_yes
    """
    qy, qn, bb = _to_float(q_yes), _to_float(q_no), _to_float(b)
    amt = _to_float(amount)

    if side == "YES":
        # log-sum-exp stable version
        max_q = max(qy, qn)
        sum_exp = math.exp((qy - max_q) / bb) + math.exp((qn - max_q) / bb)
        # new_q_yes = b * ln(exp(amt/b) * sum_exp * exp(max_q/b) - exp(qn/b))
        # = b * ln(exp(amt/b + max_q/b) * sum_exp - exp(qn/b))
        # Factor out exp(qn/b):
        # = b * (qn/b + ln(exp(amt/b + (max_q - qn)/b) * sum_exp - 1))
        term = math.exp(amt / bb + (max_q - qn) / bb) * sum_exp - 1.0
        if term <= 0:
            return Decimal("0")
        new_qy = bb * (qn / bb + math.log(term))
        shares = new_qy - qy
    else:
        max_q = max(qy, qn)
        sum_exp = math.exp((qy - max_q) / bb) + math.exp((qn - max_q) / bb)
        term = math.exp(amt / bb + (max_q - qy) / bb) * sum_exp - 1.0
        if term <= 0:
            return Decimal("0")
        new_qn = bb * (qy / bb + math.log(term))
        shares = new_qn - qn

    if shares < 0:
        return Decimal("0")
    return _to_decimal(shares)


def amount_for_sell(
    q_yes: Decimal, q_no: Decimal, b: Decimal, side: str, shares: Decimal
) -> Decimal:
    """How much currency does the user receive for selling `shares`?

    amount = cost(q_yes, q_no, b) - cost(q_yes - shares, q_no, b)  (for YES)
    """
    s = _to_float(shares)

    if side == "YES":
        new_q_yes = q_yes - shares
        if new_q_yes < 0:
            return Decimal("0")
        result = cost(q_yes, q_no, b) - cost(new_q_yes, q_no, b)
    else:
        new_q_no = q_no - shares
        if new_q_no < 0:
            return Decimal("0")
        result = cost(q_yes, q_no, b) - cost(q_yes, new_q_no, b)

    if result < 0:
        return Decimal("0")
    return result
