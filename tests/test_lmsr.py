from decimal import Decimal

import pytest

from app.services.lmsr import amount_for_sell, cost, price_no, price_yes, shares_for_buy

B = Decimal("100")


class TestPricing:
    def test_initial_prices_equal(self):
        """When q_yes == q_no == 0, prices should be 0.5 each."""
        p_yes = price_yes(Decimal("0"), Decimal("0"), B)
        p_no = price_no(Decimal("0"), Decimal("0"), B)
        assert abs(p_yes - Decimal("0.5")) < Decimal("0.0001")
        assert abs(p_no - Decimal("0.5")) < Decimal("0.0001")

    def test_prices_sum_to_one(self):
        """YES + NO prices must always sum to 1."""
        test_cases = [
            (Decimal("0"), Decimal("0")),
            (Decimal("50"), Decimal("0")),
            (Decimal("0"), Decimal("50")),
            (Decimal("100"), Decimal("50")),
            (Decimal("200"), Decimal("300")),
        ]
        for q_yes, q_no in test_cases:
            total = price_yes(q_yes, q_no, B) + price_no(q_yes, q_no, B)
            assert abs(total - Decimal("1")) < Decimal("0.0001"), f"Failed for q_yes={q_yes}, q_no={q_no}: total={total}"

    def test_buying_yes_increases_yes_price(self):
        """Buying YES shares should increase the YES price."""
        p_before = price_yes(Decimal("0"), Decimal("0"), B)
        p_after = price_yes(Decimal("50"), Decimal("0"), B)
        assert p_after > p_before

    def test_buying_no_decreases_yes_price(self):
        """Buying NO shares should decrease the YES price."""
        p_before = price_yes(Decimal("0"), Decimal("0"), B)
        p_after = price_yes(Decimal("0"), Decimal("50"), B)
        assert p_after < p_before


class TestCost:
    def test_cost_increases_with_shares(self):
        """Cost function should increase as shares increase."""
        c1 = cost(Decimal("0"), Decimal("0"), B)
        c2 = cost(Decimal("50"), Decimal("0"), B)
        c3 = cost(Decimal("100"), Decimal("0"), B)
        assert c2 > c1
        assert c3 > c2

    def test_cost_symmetric(self):
        """cost(q, 0, b) == cost(0, q, b) when starting from same state."""
        c_yes = cost(Decimal("50"), Decimal("0"), B)
        c_no = cost(Decimal("0"), Decimal("50"), B)
        assert abs(c_yes - c_no) < Decimal("0.0001")


class TestBuy:
    def test_buy_yes_returns_positive_shares(self):
        shares = shares_for_buy(Decimal("0"), Decimal("0"), B, "YES", Decimal("100"))
        assert shares > 0

    def test_buy_no_returns_positive_shares(self):
        shares = shares_for_buy(Decimal("0"), Decimal("0"), B, "NO", Decimal("100"))
        assert shares > 0

    def test_more_money_more_shares(self):
        s1 = shares_for_buy(Decimal("0"), Decimal("0"), B, "YES", Decimal("50"))
        s2 = shares_for_buy(Decimal("0"), Decimal("0"), B, "YES", Decimal("100"))
        assert s2 > s1

    def test_cost_consistency(self):
        """Buying shares and then computing the cost difference should match the amount spent."""
        amount = Decimal("100")
        shares = shares_for_buy(Decimal("0"), Decimal("0"), B, "YES", amount)
        cost_before = cost(Decimal("0"), Decimal("0"), B)
        cost_after = cost(shares, Decimal("0"), B)
        diff = cost_after - cost_before
        assert abs(diff - amount) < Decimal("0.01"), f"Cost diff {diff} != amount {amount}"


class TestSell:
    def test_sell_returns_positive_amount(self):
        amt = amount_for_sell(Decimal("50"), Decimal("0"), B, "YES", Decimal("25"))
        assert amt > 0

    def test_sell_consistency(self):
        """Buy shares, then sell them all back. Should recover most of the original amount."""
        amount = Decimal("100")
        shares = shares_for_buy(Decimal("0"), Decimal("0"), B, "YES", amount)
        # After buying, market state is (shares, 0)
        recovered = amount_for_sell(shares, Decimal("0"), B, "YES", shares)
        # Should recover almost exactly the same amount (within precision)
        assert abs(recovered - amount) < Decimal("0.01"), f"Recovered {recovered} vs spent {amount}"

    def test_cannot_sell_more_than_existing(self):
        amt = amount_for_sell(Decimal("10"), Decimal("0"), B, "YES", Decimal("20"))
        assert amt == Decimal("0")


class TestNumericalStability:
    def test_large_q_values(self):
        """Should not overflow with large q values."""
        p = price_yes(Decimal("10000"), Decimal("5000"), B)
        assert Decimal("0") <= p <= Decimal("1")
        # With b=100 and diff=5000, the price is effectively 1.0
        # Test that it doesn't crash or return NaN
        p2 = price_yes(Decimal("500"), Decimal("300"), B)
        assert Decimal("0") < p2 < Decimal("1")

    def test_very_small_amount(self):
        shares = shares_for_buy(Decimal("0"), Decimal("0"), B, "YES", Decimal("0.01"))
        assert shares > 0
