from datetime import date, timedelta

from .models import DailyCheckIn

METRICS = ["mood", "energy", "sleep_quality", "stress"]


def _average(checkins: list[DailyCheckIn]) -> dict:
    if not checkins:
        return {metric: None for metric in METRICS}
    return {metric: round(sum(getattr(c, metric) for c in checkins) / len(checkins), 1) for metric in METRICS}


def _bucket_label_week(day: date) -> str:
    return day.strftime("%a")


def _bucket_label_month(start: date, end: date) -> str:
    return f"{start.strftime('%b %-d')}–{end.strftime('%-d')}"


def _bucket_label_year(day: date) -> str:
    return day.strftime("%b")


def build_report(user, period: str) -> dict:
    today = date.today()

    if period == "week":
        start = today - timedelta(days=6)
        checkins = list(DailyCheckIn.objects.filter(user=user, date__gte=start, date__lte=today))
        by_date = {c.date: c for c in checkins}
        data_points = []
        for i in range(7):
            day = start + timedelta(days=i)
            c = by_date.get(day)
            point = {"label": _bucket_label_week(day)}
            for metric in METRICS:
                point[metric] = getattr(c, metric) if c else None
            data_points.append(point)
        previous_start = start - timedelta(days=7)
        previous_checkins = list(DailyCheckIn.objects.filter(user=user, date__gte=previous_start, date__lt=start))

    elif period == "month":
        start = today - timedelta(days=29)
        checkins = list(DailyCheckIn.objects.filter(user=user, date__gte=start, date__lte=today))
        data_points = []
        bucket_start = start
        while bucket_start <= today:
            bucket_end = min(bucket_start + timedelta(days=6), today)
            bucket_checkins = [c for c in checkins if bucket_start <= c.date <= bucket_end]
            point = {"label": _bucket_label_month(bucket_start, bucket_end), **_average(bucket_checkins)}
            data_points.append(point)
            bucket_start = bucket_end + timedelta(days=1)
        previous_start = start - timedelta(days=30)
        previous_checkins = list(DailyCheckIn.objects.filter(user=user, date__gte=previous_start, date__lt=start))

    else:  # year
        start = date(today.year - 1, today.month, 1)
        checkins = list(DailyCheckIn.objects.filter(user=user, date__gte=start, date__lte=today))
        data_points = []
        cursor = start
        while cursor <= today:
            month_end = date(cursor.year + (1 if cursor.month == 12 else 0), 1 if cursor.month == 12 else cursor.month + 1, 1) - timedelta(days=1)
            month_checkins = [c for c in checkins if c.date.year == cursor.year and c.date.month == cursor.month]
            point = {"label": _bucket_label_year(cursor), **_average(month_checkins)}
            data_points.append(point)
            cursor = date(cursor.year + (1 if cursor.month == 12 else 0), 1 if cursor.month == 12 else cursor.month + 1, 1)
        previous_year_start = date(today.year - 2, today.month, 1)
        previous_checkins = list(DailyCheckIn.objects.filter(user=user, date__gte=previous_year_start, date__lt=start))

    current_avg = _average(checkins)
    previous_avg = _average(previous_checkins)

    comparison = None
    if current_avg["mood"] is not None and previous_avg["mood"] is not None:
        delta = round(current_avg["mood"] - previous_avg["mood"], 1)
        direction = "up" if delta > 0 else "down" if delta < 0 else "steady"
        comparison = (
            f"Average mood {current_avg['mood']} this {period}, "
            f"{direction} from {previous_avg['mood']} the {period} before."
        )
    elif current_avg["mood"] is not None:
        comparison = f"Average mood {current_avg['mood']} this {period}."

    return {
        "period": period,
        "data_points": data_points,
        "averages": current_avg,
        "comparison": comparison,
        "entry_count": len(checkins),
    }
